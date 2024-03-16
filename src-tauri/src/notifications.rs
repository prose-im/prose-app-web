use mac_notification_sys::{Notification, Sound};
use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;

#[cfg(target_os = "macos")]
#[tauri::command]
fn set_badge_count(count: u32) {
    // Reference: https://github.com/tauri-apps/tauri/issues/4489
    use cocoa::{appkit::NSApp, foundation::NSString};
    use objc::{msg_send, sel, sel_impl};

    unsafe {
        let label = if count == 0 {
            cocoa::base::nil
        } else {
            NSString::alloc(cocoa::base::nil).init_str(&format!("{}", count))
        };

        let dock_tile: cocoa::base::id = msg_send![NSApp(), dockTile];
        let _: cocoa::base::id = msg_send![dock_tile, setBadgeLabel: label];
    }
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn send_notification(title: String, body: String) {
    let _ = Notification::default()
        .title(&title)
        .message(&body)
        .sound(Sound::Default)
        .send();
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn send_notification(title: String, body: String) {}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    init_notifications();
    Builder::new("notifications")
        .invoke_handler(tauri::generate_handler![send_notification, set_badge_count])
        .build()
}

#[cfg(target_os = "macos")]
pub fn init_notifications() {
    let bundle = mac_notification_sys::get_bundle_identifier_or_default("prose");
    mac_notification_sys::set_application(&bundle).unwrap();
}
#[cfg(not(target_os = "macos"))]
fn init_notifications() {}

#[tauri::command]
#[cfg(not(target_os = "macos"))]
fn set_badge_count(count: u32) {
    println!("set_badge_count is not implemented for this platform");
}
