use notifications::{Notification, NotificationProvider};
use send_wrapper::SendWrapper;
use serde::Serialize;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{AppHandle, Manager, Runtime, State};

pub(crate) struct NotificationsState {
    provider: SendWrapper<NotificationProvider>,
}

#[derive(Debug, Clone, Serialize)]
struct NotificationInteraction {
    id: String,
    interaction: String,
}

pub fn provide<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("notifications")
        .invoke_handler(tauri::generate_handler![send_notification, set_badge_count])
        .setup(|app_handle| {
            let name = match app_handle.config().package.product_name.as_ref() {
                Some(name) => name.clone(),
                None => {
                    println!("No product name found in tauri.conf.json, using default");
                    "Terminal".to_string()
                }
            };
            let mut provider = NotificationProvider::new(name.as_str());
            let app = app_handle.clone();
            provider.set_callback(move |id, resp| {
                println!("Notification {} clicked: {:?}", id, resp);
                app.emit_all(
                    "notifications:notification-event",
                    NotificationInteraction {
                        id,
                        interaction: format!("{:?}", resp),
                    },
                )
                .unwrap();
            });
            let state = NotificationsState {
                provider: SendWrapper::new(provider),
            };
            app_handle.manage(state);
            Ok(())
        })
        .build()
}

#[tauri::command]
fn send_notification<R: Runtime>(
    _app: AppHandle<R>,
    state: State<'_, NotificationsState>,
    title: String,
    body: String,
) -> String {
    Notification::new()
        .title(title.as_str())
        .subtitle(body.as_str())
        .reply(true)
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
