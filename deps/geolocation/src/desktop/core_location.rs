// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

//! macOS geolocation backend, backed by CoreLocation's `CLLocationManager`.
//!
//! `CLLocationManager` can only be used from a thread with an active run loop and delivers its
//! results asynchronously to a delegate, so this module:
//!
//! - performs every Objective-C call on the main thread through [`run_on_main`],
//! - keeps the pending requests in a shared, thread safe [`State`],
//! - blocks the calling thread until the delegate resolved the request or the timeout elapsed.
//!
//! Note that [`State`] must never be locked while dispatching to the main thread, otherwise the
//! main thread could deadlock waiting for the lock we are holding.

use std::{
    collections::HashMap,
    sync::{mpsc, Arc, Mutex, MutexGuard, OnceLock},
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use dispatch2::{run_on_main, MainThreadBound};
use objc2::{
    define_class, msg_send,
    rc::Retained,
    runtime::{NSObject, ProtocolObject},
    sel, DefinedClass, MainThreadMarker, MainThreadOnly,
};
use objc2_core_location::{
    kCLLocationAccuracyBest, kCLLocationAccuracyKilometer, CLAuthorizationStatus, CLError,
    CLLocation, CLLocationAccuracy, CLLocationManager, CLLocationManagerDelegate,
};
use objc2_foundation::{NSArray, NSBundle, NSError, NSObjectProtocol, NSString};
use tauri::{
    ipc::{Channel, InvokeResponseBody},
    plugin::PermissionState,
};

use crate::{models::*, Error};

/// Fallback for `PositionOptions::timeout`, which defaults to `0`.
const DEFAULT_TIMEOUT: u32 = 10_000;

/// How long we wait for the user to answer the system location prompt.
const PERMISSION_TIMEOUT: Duration = Duration::from_secs(60);

type PositionResult = Result<Position, String>;

enum PositionRequest {
    /// A cached position that satisfies `PositionOptions::maximum_age`.
    Cached(Position),
    /// The id of a request waiting for the delegate to deliver a position.
    Pending(u64),
}

#[derive(Clone)]
struct Watcher {
    channel: Channel,
    enable_high_accuracy: bool,
}

#[derive(Default)]
struct State {
    next_request_id: u64,
    /// `get_current_position` calls waiting for a location update.
    position_requests: HashMap<u64, mpsc::Sender<PositionResult>>,
    /// `request_permissions` calls waiting for the authorization to change.
    permission_requests: Vec<mpsc::Sender<()>>,
    /// The channels registered via `watch_position`, keyed by channel id.
    watchers: HashMap<u32, Watcher>,
    is_updating: bool,
}

impl State {
    fn next_request_id(&mut self) -> u64 {
        let id = self.next_request_id;
        self.next_request_id = self.next_request_id.wrapping_add(1);
        id
    }

    /// The accuracy is a property of the shared location manager, so a request must never lower
    /// the accuracy an active watcher asked for.
    fn wants_high_accuracy(&self, request: bool) -> bool {
        request
            || self
                .watchers
                .values()
                .any(|watcher| watcher.enable_high_accuracy)
    }
}

struct Ivars {
    state: Arc<Mutex<State>>,
}

define_class!(
    // SAFETY:
    // - The superclass NSObject does not have any subclassing requirements.
    // - `Delegate` does not implement `Drop`.
    #[unsafe(super(NSObject))]
    #[thread_kind = MainThreadOnly]
    #[name = "TauriPluginGeolocationDelegate"]
    #[ivars = Ivars]
    struct Delegate;

    unsafe impl NSObjectProtocol for Delegate {}

    unsafe impl CLLocationManagerDelegate for Delegate {
        #[unsafe(method(locationManager:didUpdateLocations:))]
        #[allow(non_snake_case)]
        fn locationManager_didUpdateLocations(
            &self,
            _manager: &CLLocationManager,
            locations: &NSArray<CLLocation>,
        ) {
            // The most recent location is the last one, older ones are not interesting to us.
            let result = match locations.lastObject() {
                Some(location) => position_from_location(&location),
                None => Err("Location service returned an empty location array.".to_string()),
            };

            self.resolve_position_requests(result.clone());
            self.notify_watchers(result);
        }

        #[unsafe(method(locationManager:didFailWithError:))]
        #[allow(non_snake_case)]
        fn locationManager_didFailWithError(&self, _manager: &CLLocationManager, error: &NSError) {
            let message = error.localizedDescription().to_string();
            log::error!("CoreLocation failed to determine the position: {message}");

            self.resolve_position_requests(Err(message.clone()));

            // `kCLErrorLocationUnknown` is transient while continuous updates are running, so it
            // shouldn't be reported to watchers, CoreLocation keeps trying on its own.
            if CLError(error.code()) != CLError::LocationUnknown {
                self.notify_watchers(Err(message));
            }
        }

        #[unsafe(method(locationManagerDidChangeAuthorization:))]
        #[allow(non_snake_case)]
        fn locationManagerDidChangeAuthorization(&self, manager: &CLLocationManager) {
            let status = authorization_status(manager);

            let permission_requests = std::mem::take(&mut self.state().permission_requests);
            for sender in permission_requests {
                let _ = sender.send(());
            }

            match permission_state(status) {
                // The user answered the prompt, so we can finally start locating.
                PermissionState::Granted => {
                    let (has_position_requests, should_start_updating) = {
                        let state = self.state();
                        (
                            !state.position_requests.is_empty(),
                            !state.watchers.is_empty() && !state.is_updating,
                        )
                    };

                    if has_position_requests {
                        unsafe { manager.requestLocation() };
                    }

                    if should_start_updating {
                        unsafe { manager.startUpdatingLocation() };
                        self.state().is_updating = true;
                    }
                }
                // Nothing will ever be delivered, so let the pending requests fail right away
                // instead of waiting for their timeout.
                PermissionState::Denied => {
                    let message = "Location permission was denied.".to_string();
                    self.resolve_position_requests(Err(message.clone()));
                    self.notify_watchers(Err(message));
                }
                _ => {}
            }
        }
    }
);

impl Delegate {
    fn new(state: Arc<Mutex<State>>, mtm: MainThreadMarker) -> Retained<Self> {
        let this = Self::alloc(mtm).set_ivars(Ivars { state });
        unsafe { msg_send![super(this), init] }
    }

    fn state(&self) -> MutexGuard<'_, State> {
        self.ivars()
            .state
            .lock()
            .unwrap_or_else(|error| error.into_inner())
    }

    fn resolve_position_requests(&self, result: PositionResult) {
        let senders: Vec<_> = self.state().position_requests.drain().collect();

        for (_, sender) in senders {
            let _ = sender.send(result.clone());
        }
    }

    fn notify_watchers(&self, result: PositionResult) {
        let watchers: Vec<_> = self
            .state()
            .watchers
            .iter()
            .map(|(id, watcher)| (*id, watcher.channel.clone()))
            .collect();
        if watchers.is_empty() {
            return;
        }

        let event = match result {
            Ok(position) => WatchEvent::Position(position),
            Err(message) => WatchEvent::Error(message),
        };
        let payload = match serde_json::to_string(&event) {
            Ok(payload) => payload,
            Err(error) => {
                log::error!("Couldn't serialize the watch event payload: {error}");
                return;
            }
        };

        for (id, channel) in watchers {
            if let Err(error) = channel.send(InvokeResponseBody::Json(payload.clone())) {
                log::error!("Couldn't send the watch event to channel {id}: {error}");
            }
        }
    }
}

struct Inner {
    manager: Retained<CLLocationManager>,
    /// `CLLocationManager` only holds a weak reference to its delegate, so we have to keep it
    /// alive ourselves.
    _delegate: Retained<Delegate>,
}

pub(crate) struct Backend {
    state: Arc<Mutex<State>>,
    /// Created on first use so that apps which never call into the plugin don't instantiate a
    /// `CLLocationManager` at all.
    inner: OnceLock<MainThreadBound<Inner>>,
}

impl Backend {
    pub fn new() -> Self {
        Self {
            state: Arc::default(),
            inner: OnceLock::new(),
        }
    }

    /// Runs `f` on the main thread with the shared `CLLocationManager`.
    ///
    /// The [`State`] mutex must not be locked by the caller, see the module documentation.
    fn with_manager<T: Send>(
        &self,
        f: impl Send + FnOnce(&CLLocationManager, MainThreadMarker) -> T,
    ) -> T {
        let state = self.state.clone();
        let cell = &self.inner;

        run_on_main(move |mtm| {
            let inner = cell
                .get_or_init(|| {
                    let manager = unsafe { CLLocationManager::new() };
                    let delegate = Delegate::new(state, mtm);
                    unsafe { manager.setDelegate(Some(ProtocolObject::from_ref(&*delegate))) };

                    MainThreadBound::new(
                        Inner {
                            manager,
                            _delegate: delegate,
                        },
                        mtm,
                    )
                })
                .get(mtm);

            f(&inner.manager, mtm)
        })
    }

    fn state(&self) -> MutexGuard<'_, State> {
        self.state.lock().unwrap_or_else(|error| error.into_inner())
    }

    pub fn get_current_position(
        &self,
        options: Option<PositionOptions>,
    ) -> crate::Result<Position> {
        let options = options.unwrap_or_default();
        let timeout = if options.timeout == 0 {
            DEFAULT_TIMEOUT
        } else {
            options.timeout
        };
        let maximum_age = options.maximum_age;
        let enable_high_accuracy = options.enable_high_accuracy;

        let (sender, receiver) = mpsc::channel();
        let state = self.state.clone();

        let request =
            self.with_manager(move |manager, _mtm| -> crate::Result<PositionRequest> {
                let status = authorization_status(manager);
                if permission_state(status) == PermissionState::Denied {
                    return Err(Error::PermissionDenied);
                }

                // Return the cached position if it is recent enough.
                if maximum_age > 0 {
                    if let Some(position) = unsafe { manager.location() }
                        .and_then(|location| position_from_location(&location).ok())
                        .filter(|position| is_recent_enough(position, maximum_age))
                    {
                        return Ok(PositionRequest::Cached(position));
                    }
                }

                let (id, is_updating, high_accuracy) = {
                    let mut state = state.lock().unwrap_or_else(|error| error.into_inner());
                    let id = state.next_request_id();
                    state.position_requests.insert(id, sender);
                    (
                        id,
                        state.is_updating,
                        state.wants_high_accuracy(enable_high_accuracy),
                    )
                };

                unsafe { manager.setDesiredAccuracy(desired_accuracy(high_accuracy)) };

                if status == CLAuthorizationStatus::NotDetermined {
                    // The position is requested once the user answered the prompt.
                    if let Err(error) = request_authorization(manager) {
                        state
                            .lock()
                            .unwrap_or_else(|error| error.into_inner())
                            .position_requests
                            .remove(&id);
                        return Err(error);
                    }
                } else if !is_updating {
                    // While a watcher is running we simply wait for the next update instead of
                    // interfering with the ongoing continuous updates.
                    unsafe { manager.requestLocation() };
                }

                Ok(PositionRequest::Pending(id))
            })?;

        let id = match request {
            PositionRequest::Cached(position) => return Ok(position),
            PositionRequest::Pending(id) => id,
        };

        // Waiting on the main thread would prevent the delegate from ever being called.
        if MainThreadMarker::new().is_some() {
            self.state().position_requests.remove(&id);
            return Err(Error::WouldBlockMainThread);
        }

        match receiver.recv_timeout(Duration::from_millis(timeout.into())) {
            Ok(Ok(position)) => Ok(position),
            Ok(Err(message)) => Err(Error::CoreLocation(message)),
            Err(_) => {
                self.state().position_requests.remove(&id);
                Err(Error::Timeout)
            }
        }
    }

    pub fn watch_position(
        &self,
        options: PositionOptions,
        callback_channel: Channel,
    ) -> crate::Result<()> {
        let channel_id = callback_channel.id();

        let high_accuracy = {
            let mut state = self.state();
            state.watchers.insert(
                channel_id,
                Watcher {
                    channel: callback_channel,
                    enable_high_accuracy: options.enable_high_accuracy,
                },
            );
            state.wants_high_accuracy(options.enable_high_accuracy)
        };

        let state = self.state.clone();
        let result = self.with_manager(move |manager, _mtm| -> crate::Result<()> {
            unsafe { manager.setDesiredAccuracy(desired_accuracy(high_accuracy)) };

            let status = authorization_status(manager);
            if permission_state(status) == PermissionState::Denied {
                return Err(Error::PermissionDenied);
            }

            if status == CLAuthorizationStatus::NotDetermined {
                // The updates are started once the user answered the prompt.
                request_authorization(manager)?;
                return Ok(());
            }

            let is_updating = {
                let state = state.lock().unwrap_or_else(|error| error.into_inner());
                state.is_updating
            };
            if !is_updating {
                unsafe { manager.startUpdatingLocation() };
                state
                    .lock()
                    .unwrap_or_else(|error| error.into_inner())
                    .is_updating = true;
            }

            Ok(())
        });

        if result.is_err() {
            self.state().watchers.remove(&channel_id);
        }

        result
    }

    pub fn clear_watch(&self, channel_id: u32) -> crate::Result<()> {
        let has_watchers = {
            let mut state = self.state();
            state.watchers.remove(&channel_id);
            !state.watchers.is_empty()
        };

        if !has_watchers {
            let state = self.state.clone();
            self.with_manager(move |manager, _mtm| {
                unsafe { manager.stopUpdatingLocation() };
                state
                    .lock()
                    .unwrap_or_else(|error| error.into_inner())
                    .is_updating = false;
            });
        }

        Ok(())
    }

    pub fn check_permissions(&self) -> crate::Result<PermissionStatus> {
        self.with_manager(|manager, _mtm| {
            if !location_services_enabled() {
                return Err(Error::LocationServicesDisabled);
            }

            // macOS doesn't differentiate between coarse and precise location permissions.
            let state = permission_state(authorization_status(manager));

            Ok(PermissionStatus {
                location: state,
                coarse_location: state,
            })
        })
    }

    pub fn request_permissions(
        &self,
        _permissions: Option<Vec<PermissionType>>,
    ) -> crate::Result<PermissionStatus> {
        // Waiting on the main thread would prevent the delegate from ever being called.
        if MainThreadMarker::new().is_some() {
            return Err(Error::WouldBlockMainThread);
        }

        let (sender, receiver) = mpsc::channel();
        let state = self.state.clone();

        // Only wait when the prompt is actually going to be shown, otherwise the authorization
        // never changes and we would always wait for the full timeout.
        let prompted = self.with_manager(move |manager, _mtm| -> crate::Result<bool> {
            if !location_services_enabled() {
                return Err(Error::LocationServicesDisabled);
            }

            if authorization_status(manager) != CLAuthorizationStatus::NotDetermined {
                return Ok(false);
            }

            request_authorization(manager)?;
            state
                .lock()
                .unwrap_or_else(|error| error.into_inner())
                .permission_requests
                .push(sender);

            Ok(true)
        })?;

        if prompted && receiver.recv_timeout(PERMISSION_TIMEOUT).is_err() {
            return Err(Error::Timeout);
        }

        self.check_permissions()
    }
}

fn desired_accuracy(enable_high_accuracy: bool) -> CLLocationAccuracy {
    if enable_high_accuracy {
        unsafe { kCLLocationAccuracyBest }
    } else {
        unsafe { kCLLocationAccuracyKilometer }
    }
}

fn location_services_enabled() -> bool {
    unsafe { CLLocationManager::locationServicesEnabled_class() }
}

/// Asks the user for the location permission.
///
/// macOS silently ignores the request when the app doesn't declare why it needs the location, in
/// which case no prompt is shown and the authorization never changes, so this is reported as an
/// error instead of letting the caller wait for its timeout.
fn request_authorization(manager: &CLLocationManager) -> crate::Result<()> {
    const USAGE_DESCRIPTION_KEYS: [&str; 3] = [
        "NSLocationUsageDescription",
        "NSLocationWhenInUseUsageDescription",
        "NSLocationAlwaysAndWhenInUseUsageDescription",
    ];

    let bundle = NSBundle::mainBundle();
    // `objectForInfoDictionaryKey` is `unsafe` in objc2-foundation 0.3.0 and safe since 0.3.1, so
    // the block is kept for the former and allowed to be redundant for the latter.
    #[allow(unused_unsafe)]
    let has_usage_description = USAGE_DESCRIPTION_KEYS.iter().any(|key| {
        unsafe { bundle.objectForInfoDictionaryKey(&NSString::from_str(key)) }.is_some()
    });

    if !has_usage_description {
        return Err(Error::MissingUsageDescription);
    }

    unsafe { manager.requestWhenInUseAuthorization() };

    Ok(())
}

fn authorization_status(manager: &CLLocationManager) -> CLAuthorizationStatus {
    // The instance property is only available on macOS 11+, fall back to the deprecated class
    // method on older versions.
    if manager.respondsToSelector(sel!(authorizationStatus)) {
        unsafe { manager.authorizationStatus() }
    } else {
        #[allow(deprecated)]
        unsafe {
            CLLocationManager::authorizationStatus_class()
        }
    }
}

fn permission_state(status: CLAuthorizationStatus) -> PermissionState {
    match status {
        CLAuthorizationStatus::NotDetermined => PermissionState::Prompt,
        CLAuthorizationStatus::Restricted | CLAuthorizationStatus::Denied => {
            PermissionState::Denied
        }
        CLAuthorizationStatus::AuthorizedAlways | CLAuthorizationStatus::AuthorizedWhenInUse => {
            PermissionState::Granted
        }
        _ => PermissionState::Prompt,
    }
}

fn position_from_location(location: &CLLocation) -> PositionResult {
    let accuracy = unsafe { location.horizontalAccuracy() };
    if accuracy < 0.0 {
        return Err("Location service returned an invalid position.".to_string());
    }

    let coordinate = unsafe { location.coordinate() };
    let altitude_accuracy = unsafe { location.verticalAccuracy() };
    let speed = unsafe { location.speed() };
    let heading = unsafe { location.course() };
    let timestamp = unsafe { location.timestamp().timeIntervalSince1970() };

    Ok(Position {
        timestamp: (timestamp * 1000.0).max(0.0) as u64,
        coords: Coordinates {
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            accuracy,
            // CoreLocation reports a negative value when the information is unavailable, which the
            // JavaScript API expects to be `null`.
            altitude_accuracy: (altitude_accuracy >= 0.0).then_some(altitude_accuracy),
            altitude: (altitude_accuracy >= 0.0).then(|| unsafe { location.altitude() }),
            speed: (speed >= 0.0).then_some(speed),
            heading: (heading >= 0.0).then_some(heading),
        },
    })
}

fn is_recent_enough(position: &Position, maximum_age: u32) -> bool {
    now_millis().saturating_sub(position.timestamp) <= u64::from(maximum_age)
}

fn now_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn maps_the_authorization_status() {
        assert_eq!(
            permission_state(CLAuthorizationStatus::NotDetermined),
            PermissionState::Prompt
        );
        assert_eq!(
            permission_state(CLAuthorizationStatus::Denied),
            PermissionState::Denied
        );
        assert_eq!(
            permission_state(CLAuthorizationStatus::Restricted),
            PermissionState::Denied
        );
        assert_eq!(
            permission_state(CLAuthorizationStatus::AuthorizedAlways),
            PermissionState::Granted
        );
        assert_eq!(
            permission_state(CLAuthorizationStatus::AuthorizedWhenInUse),
            PermissionState::Granted
        );
    }

    #[test]
    fn honors_the_maximum_age() {
        let position = Position {
            timestamp: now_millis() - 5_000,
            ..Default::default()
        };

        assert!(!is_recent_enough(&position, 0));
        assert!(!is_recent_enough(&position, 1_000));
        assert!(is_recent_enough(&position, 10_000));
    }

    #[test]
    fn never_lowers_the_accuracy_of_a_watcher() {
        let mut state = State::default();

        assert!(!state.wants_high_accuracy(false));
        assert!(state.wants_high_accuracy(true));

        state.watchers.insert(
            0,
            Watcher {
                channel: Channel::new(|_| Ok(())),
                enable_high_accuracy: true,
            },
        );

        assert!(state.wants_high_accuracy(false));
    }
}
