// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

#![cfg(target_os = "macos")]
#![allow(improper_ctypes)]

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use objc2::rc::autoreleasepool;
use std::ops::Deref;
use std::sync::Once;

use objc2_foundation::{NSDictionary, NSString};

pub use crate::notification::NotificationResponse;
pub use crate::notification_struct::Notification;

pub mod misc;
mod notification;
pub mod notification_struct;

/**************************************************************************
 * MODULES
 * ************************************************************************* */
mod sys {
    use objc2_foundation::{NSDictionary, NSString};

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
    autoreleasepool(|pool| {
        let identifier = match unsafe { identifier.as_ref() } {
            Some(identifier) => identifier.as_str(pool).to_owned(),
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
    });
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

pub fn run_main_loop_once() {
    unsafe {
        sys::run_main_loop_once();
    }
}
