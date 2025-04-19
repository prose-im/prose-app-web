// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

#![allow(unused_imports)]

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

#[cfg(target_os = "macos")]
use notifications as macos;
use send_wrapper::SendWrapper;
use serde::Serialize;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{AppHandle, Emitter, Manager, Runtime, State};

/**************************************************************************
 * STRUCTURES
 * ************************************************************************* */

pub(crate) struct NotificationsState {
    #[cfg(target_os = "macos")]
    _provider: SendWrapper<macos::NotificationProvider>,
    #[cfg(not(target_os = "macos"))]
    _provider: SendWrapper<()>,
}

#[cfg(target_os = "macos")]
#[derive(Debug, Clone, Serialize)]
struct EventNotificationInteraction {
    id: String,
    action: String,
}

/**************************************************************************
 * COMMANDS
 * ************************************************************************* */

#[cfg(target_os = "macos")]
#[tauri::command]
fn send_notification<R: Runtime>(
    _app: AppHandle<R>,
    _state: State<'_, NotificationsState>,
    title: String,
    body: String,
) -> Option<String> {
    macos::Notification::new()
        .title(title.as_str())
        .subtitle(body.as_str())
        .send()
        .ok()
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn send_notification<R: Runtime>(
    _app: AppHandle<R>,
    _state: State<'_, NotificationsState>,
    _title: String,
    _body: String,
) -> Option<String> {
    // TODO: need to implement notifications for eg. Windows
    None
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
#[tauri::command]
fn set_badge_count<R: Runtime>(app: AppHandle<R>, count: u32) {
    let window = app.get_webview_window("main").unwrap();

    #[cfg(target_os = "macos")]
    {
        window
            .set_badge_label(if count > 0 {
                Some(count.to_string())
            } else {
                None
            })
            .ok();
    }

    #[cfg(target_os = "linux")]
    {
        window
            .set_badge_count(if count > 0 { Some(count as i64) } else { None })
            .ok();
    }
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn set_badge_count<R: Runtime>(_app: AppHandle<R>, _count: u32) {
    // Not implemented
}

/**************************************************************************
 * PROVIDERS
 * ************************************************************************* */

pub fn provide<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("notifications")
        .invoke_handler(tauri::generate_handler![send_notification, set_badge_count])
        .setup(|app_handle, _| {
            #[cfg(target_os = "macos")]
            let state = {
                let mut provider = macos::NotificationProvider::new(
                    app_handle.config().product_name.as_ref().unwrap(),
                );

                let app = app_handle.clone();

                provider.set_callback(move |id, response| {
                    // Map response to known action
                    let action = match response {
                        macos::NotificationResponse::Click => "click",
                        macos::NotificationResponse::Reply(_) => "reply",
                        macos::NotificationResponse::CloseButton(_) => "close",
                        macos::NotificationResponse::ActionButton(_) => "other",
                        macos::NotificationResponse::None => "none",
                    };

                    app.emit(
                        "notification:interaction",
                        EventNotificationInteraction {
                            id,
                            action: action.to_string(),
                        },
                    )
                    .unwrap();
                });

                NotificationsState {
                    _provider: SendWrapper::new(provider),
                }
            };

            #[cfg(not(target_os = "macos"))]
            let state = {
                NotificationsState {
                    _provider: SendWrapper::new(()),
                }
            };

            app_handle.manage(state);

            Ok(())
        })
        .build()
}
