// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use notifications::{Notification, NotificationProvider, NotificationResponse};
use send_wrapper::SendWrapper;
use serde::Serialize;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{AppHandle, Emitter, Manager, Runtime, State};

/**************************************************************************
 * STRUCTURES
 * ************************************************************************* */

pub(crate) struct NotificationsState {
    _provider: SendWrapper<NotificationProvider>,
}

#[derive(Debug, Clone, Serialize)]
struct EventNotificationInteraction {
    id: String,
    action: String,
}

/**************************************************************************
 * COMMANDS
 * ************************************************************************* */

#[tauri::command]
fn send_notification<R: Runtime>(
    _app: AppHandle<R>,
    _state: State<'_, NotificationsState>,
    title: String,
    body: String,
) -> String {
    Notification::new()
        .title(title.as_str())
        .subtitle(body.as_str())
        .send()
        .unwrap()
}

#[tauri::command]
fn set_badge_count(count: u32) {
    use notifications::misc::set_badge;
    if count > 0 {
        set_badge(Some(&count.to_string()));
    } else {
        set_badge(None);
    }
}

/**************************************************************************
 * PROVIDERS
 * ************************************************************************* */

pub fn provide<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("notifications")
        .invoke_handler(tauri::generate_handler![send_notification, set_badge_count])
        .setup(|app_handle, _| {
            let name = app_handle
                .config()
                .product_name
                .as_ref()
                .map(|value| value.to_string())
                .unwrap_or("Prose".to_string());

            let mut provider = NotificationProvider::new(&name);

            let app = app_handle.clone();

            provider.set_callback(move |id, response| {
                // Map response to known action
                let action = match response {
                    NotificationResponse::Click => "click",
                    NotificationResponse::Reply(_) => "reply",
                    NotificationResponse::CloseButton(_) => "close",
                    NotificationResponse::ActionButton(_) => "other",
                    NotificationResponse::None => "none",
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

            let state = NotificationsState {
                _provider: SendWrapper::new(provider),
            };

            app_handle.manage(state);

            Ok(())
        })
        .build()
}
