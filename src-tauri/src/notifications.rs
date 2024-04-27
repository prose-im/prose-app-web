// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */


use notifications::NotificationProvider;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;

static mut NOTIFICATION_PROVIDER: Option<NotificationProvider> = None;

/**************************************************************************
 * COMMANDS
 * ************************************************************************* */

#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn send_notification(title: String, body: String) -> &'static str {}

#[cfg(target_os = "macos")]
#[tauri::command]
fn send_notification(title: String, body: String) -> &'static str {
    use notifications::Notification;
    Notification::new()
        .title(&title)
        .subtitle(&body)
        .reply(true)
        .send().unwrap();
    "none"
}

#[tauri::command]
#[cfg(not(target_os = "macos"))]
fn set_badge_count(count: u32) {
    println!("set_badge_count is not implemented for this platform");
}

#[cfg(target_os = "macos")]
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
    provide_notifications();

    Builder::new("notifications")
        .invoke_handler(tauri::generate_handler![send_notification, set_badge_count])
        .build()
}

#[cfg(not(target_os = "macos"))]
fn provide_notifications() {}

#[cfg(target_os = "macos")]
pub fn provide_notifications() {
    //let bundle = mac_notification_sys::get_bundle_identifier_or_default("terminal");
    //println!("bundle: {}", bundle);
    //mac_notification_sys::set_application(&bundle).unwrap();
    println!("provide_notifications");
    let mut provider = NotificationProvider::new("Prose");
    provider.set_callback(|id, response| {
        println!("notification activated {}: {:?}", id, response);
    });
    unsafe {
        NOTIFICATION_PROVIDER = Some(provider);
    }
}
