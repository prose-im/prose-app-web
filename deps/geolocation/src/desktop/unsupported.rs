// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

//! Fallback implementation for desktop platforms without a geolocation backend.

use tauri::ipc::Channel;

use crate::models::*;

pub(crate) struct Backend;

impl Backend {
    pub fn new() -> Self {
        Self
    }

    pub fn get_current_position(
        &self,
        _options: Option<PositionOptions>,
    ) -> crate::Result<Position> {
        Ok(Position::default())
    }

    pub fn watch_position(
        &self,
        _options: PositionOptions,
        _callback_channel: Channel,
    ) -> crate::Result<()> {
        Ok(())
    }

    pub fn clear_watch(&self, _channel_id: u32) -> crate::Result<()> {
        Ok(())
    }

    pub fn check_permissions(&self) -> crate::Result<PermissionStatus> {
        Ok(PermissionStatus::default())
    }

    pub fn request_permissions(
        &self,
        _permissions: Option<Vec<PermissionType>>,
    ) -> crate::Result<PermissionStatus> {
        Ok(PermissionStatus::default())
    }
}
