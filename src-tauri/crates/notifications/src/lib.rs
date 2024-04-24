// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

#![cfg(target_os = "macos")]
#![allow(improper_ctypes)]

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

mod notification;

use crate::notification::NotificationResponse;
use objc::class;
use objc::runtime::Object;
use objc::{msg_send, sel, sel_impl};
use objc_foundation::NSString;
use objc_foundation::{INSString, NSDictionary};
use std::ops::Deref;
use std::sync::Once;
use uuid::Uuid;

/**************************************************************************
 * MODULES
 * ************************************************************************* */
mod sys {
    use objc_foundation::{NSDictionary, NSString};
    use objc_id::Id;

    #[link(name = "notification")]
    extern "C" {
        pub fn send_notification(title: *const NSString, message: *const NSString) -> Id<NSString>;
    }
    #[link(name = "notification")]
    extern "C" {
        pub fn init(
            app_name: *const NSString,
            callback: extern "C" fn(
                identifier: *const NSString,
                event: *const NSDictionary<NSString, NSString>,
            ),
        );
    }

    #[link(name = "notification")]
    extern "C" {
        pub fn run_main_loop_once();
    }
}

/**************************************************************************
 * METHODS
 * ************************************************************************* */

static INIT: Once = Once::new();
static mut NOTIFICATION_CALLBACK: Option<Box<dyn Fn(String, NotificationResponse)>> = None;

extern "C" fn notification_callback(
    identifier: *const NSString,
    event: *const NSDictionary<NSString, NSString>,
) {
    let identifier = match unsafe { identifier.as_ref() } {
        Some(identifier) => identifier.as_str().to_owned(),
        None => return,
    };
    let event = match unsafe { event.as_ref() } {
        Some(event) => event,
        None => return,
    };

    let response = NotificationResponse::from_dictionary(event);

    if let Some(func) = unsafe { NOTIFICATION_CALLBACK.as_ref() } {
        func(identifier, response);
    }
}

/// Initialize the notification system
/// This function should be called once in the application
pub fn init(app_name: &str) {
    let app_name = NSString::from_str(app_name);
    let app_name = app_name.deref();

    unsafe {
        sys::init(app_name, notification_callback);
    }
}

/// # Safety
/// - This function is not thread safe and should be called once.
/// - The provided func is not allowed to panic or unwind, it is intended to just send something on a channel or similar
pub unsafe fn add_notification_callback<F>(callback: F)
where
    F: Fn(String, NotificationResponse) + 'static,
{
    if INIT.is_completed() {
        eprintln!("init can only be called once!");
        return;
    }
    INIT.call_once(|| unsafe {
        NOTIFICATION_CALLBACK = Some(Box::new(callback));
    });
}

pub fn make_download_bounce(filename: &str) {
    let notification_name = NSString::from_str("com.apple.DownloadFileFinished");
    let file_name = NSString::from_str(filename);

    unsafe {
        let notification_center: *mut Object =
            msg_send![class!(NSDistributedNotificationCenter), defaultCenter];
        let _: () =
            msg_send![notification_center, postNotificationName:notification_name object:file_name];
    }
}

pub fn run_main_loop_once() {
    unsafe {
        sys::run_main_loop_once();
    }
}

pub fn send_notification(title: &str, message: &str) -> String {
    let title = NSString::from_str(title);
    let message = NSString::from_str(message);
    let id = Uuid::new_v4().to_string();
    let id_ns_string = NSString::from_str(&id);

    unsafe {
        let notification: *mut Object = msg_send![class!(NSUserNotification), alloc];
        let notification: *mut Object = msg_send![notification, init];
        let _: () = msg_send![notification, setTitle:title];
        let _: () = msg_send![notification, setInformativeText:message];
        let _: () = msg_send![notification, setIdentifier:id_ns_string];

        if (true) {
            // has reply button
            let _: () = msg_send![notification, setHasReplyButton:1];
        }

        let notification_center: *mut Object = msg_send![
            class!(NSUserNotificationCenter),
            defaultUserNotificationCenter
        ];
        let _: () = msg_send![notification_center, deliverNotification:notification];
    }
    id
}
