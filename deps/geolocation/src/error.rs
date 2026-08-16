// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use serde::{ser::Serializer, Serialize};

pub type Result<T> = std::result::Result<T, Error>;

// TODO: Improve Error handling (different typed errors instead of one (stringified) PluginInvokeError for all mobile errors)

#[derive(Debug, thiserror::Error)]
#[cfg_attr(feature = "specta", derive(specta::Type))]
pub enum Error {
    #[cfg(mobile)]
    #[error(transparent)]
    PluginInvoke(
        #[cfg_attr(feature = "specta", serde(skip))]
        #[from]
        tauri::plugin::mobile::PluginInvokeError,
    ),
    /// Location services are turned off system wide.
    #[cfg(target_os = "macos")]
    #[error("Location services are not enabled.")]
    LocationServicesDisabled,
    /// The location permission was denied, either by the user or by a system policy.
    #[cfg(target_os = "macos")]
    #[error("Location permission was denied.")]
    PermissionDenied,
    /// The app doesn't declare why it needs the location, so macOS never shows the prompt.
    #[cfg(target_os = "macos")]
    #[error("The app's `Info.plist` must contain a `NSLocationUsageDescription` key to be able to request the location permission.")]
    MissingUsageDescription,
    /// No position was received within `PositionOptions::timeout`.
    #[cfg(target_os = "macos")]
    #[error("Timed out while waiting for a position.")]
    Timeout,
    /// The platform location service reported an error.
    #[cfg(target_os = "macos")]
    #[error("{0}")]
    CoreLocation(String),
    /// The call would have to block the main thread, which is where CoreLocation delivers its
    /// results, so it could never complete.
    #[cfg(target_os = "macos")]
    #[error("This method cannot be called from the main thread on macOS, call it from another thread instead.")]
    WouldBlockMainThread,
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
