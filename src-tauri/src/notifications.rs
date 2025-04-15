// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

#[cfg(target_os = "macos")]
use notifications as macos;
use send_wrapper::SendWrapper;
#[cfg(target_os = "macos")]
use serde::Serialize;
use tauri::plugin::{Builder, TauriPlugin};
#[cfg(target_os = "macos")]
use tauri::Emitter;
use tauri::{AppHandle, Manager, Runtime, State};

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

#[cfg(target_os = "macos")]
#[tauri::command]
fn set_badge_count(count: u32) {
    if count > 0 {
        macos::misc::set_badge(Some(&count.to_string()));
    } else {
        macos::misc::set_badge(None);
    }
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn set_badge_count(_count: u32) {
    // TODO: need to implement badges for eg. Windows
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
