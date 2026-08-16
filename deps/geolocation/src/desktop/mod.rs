// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use serde::de::DeserializeOwned;
use tauri::{
    ipc::{Channel, InvokeResponseBody},
    plugin::PluginApi,
    AppHandle, Runtime,
};

use crate::models::*;

#[cfg(target_os = "macos")]
mod core_location;
#[cfg(target_os = "macos")]
use core_location::Backend;

#[cfg(not(target_os = "macos"))]
mod unsupported;
#[cfg(not(target_os = "macos"))]
use unsupported::Backend;

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<Geolocation<R>> {
    Ok(Geolocation {
        _app: app.clone(),
        backend: Backend::new(),
    })
}

/// Access to the geolocation APIs.
pub struct Geolocation<R: Runtime> {
    _app: AppHandle<R>,
    backend: Backend,
}

impl<R: Runtime> Geolocation<R> {
    pub fn get_current_position(
        &self,
        options: Option<PositionOptions>,
    ) -> crate::Result<Position> {
        self.backend.get_current_position(options)
    }

    /// Register a position watcher. This method returns an id to use in `clear_watch`.
    pub fn watch_position<F: Fn(WatchEvent) + Send + Sync + 'static>(
        &self,
        options: PositionOptions,
        callback: F,
    ) -> crate::Result<u32> {
        let channel = Channel::new(move |event| {
            let payload = match event {
                InvokeResponseBody::Json(payload) => serde_json::from_str::<WatchEvent>(&payload)
                    .unwrap_or_else(|error| {
                        WatchEvent::Error(format!(
                            "Couldn't deserialize watch event payload: `{error}`"
                        ))
                    }),
                _ => WatchEvent::Error("Unexpected watch event payload.".to_string()),
            };

            callback(payload);

            Ok(())
        });
        let id = channel.id();

        self.watch_position_inner(options, channel)?;

        Ok(id)
    }

    pub(crate) fn watch_position_inner(
        &self,
        options: PositionOptions,
        callback_channel: Channel,
    ) -> crate::Result<()> {
        self.backend.watch_position(options, callback_channel)
    }

    pub fn clear_watch(&self, channel_id: u32) -> crate::Result<()> {
        self.backend.clear_watch(channel_id)
    }

    pub fn check_permissions(&self) -> crate::Result<PermissionStatus> {
        self.backend.check_permissions()
    }

    pub fn request_permissions(
        &self,
        permissions: Option<Vec<PermissionType>>,
    ) -> crate::Result<PermissionStatus> {
        self.backend.request_permissions(permissions)
    }
}
