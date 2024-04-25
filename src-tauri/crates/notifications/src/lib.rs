// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

#![cfg(target_os = "macos")]
#![allow(improper_ctypes)]

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use objc2::__framework_prelude::{Id, NSObject};
use objc2::rc::autoreleasepool;
use objc2::runtime::{NSObjectProtocol, ProtocolObject};
use std::ops::Deref;
use std::os::raw::c_int;
use std::sync::Once;

use objc2::rc::Allocated;
use objc2::{ClassType, DeclaredClass, ProtocolType};
use objc2_foundation::{
    MainThreadMarker, NSCopying, NSUserNotification, NSUserNotificationCenter,
    NSUserNotificationCenterDelegate, NSZone,
};

use crate::delegate::RustNotificationDelegate;
use objc2_foundation::{NSDate, NSDefaultRunLoopMode, NSDictionary, NSRunLoop, NSString};

pub use crate::notification::NotificationResponse;
pub use crate::notification_struct::Notification;

mod delegate;
pub mod misc;
mod notification;
pub mod notification_struct;

/**************************************************************************
 * MODULES
 * ************************************************************************* */
mod sys {
    use crate::delegate::RustNotificationDelegate;
    use objc2_foundation::{NSDictionary, NSString, NSUserNotificationCenterDelegate};

    #[link(name = "notification")]
    extern "C" {
        pub fn init(app_name: *const NSString); // -> *const NSUserNotificationCenterDelegate;
    }

    #[link(name = "notification")]
    extern "C" {
        pub fn run_main_loop_once();
    }
}

/**************************************************************************
 * METHODS
 * ************************************************************************* */

/// Initialize the notification system
/// This function should be called once in the application
pub fn init(app_name: &str) {
    let app_name = NSString::from_str(app_name);
    let app_name = app_name.deref();

    unsafe {
        sys::init(app_name);
        let delegate = RustNotificationDelegate::new();
        let notification_center = NSUserNotificationCenter::defaultUserNotificationCenter();
        notification_center.setDelegate(Some(ProtocolObject::from_ref(delegate.as_ref())));
        delegate.userNotificationCenter_didActivateNotification(
            notification_center.as_ref(),
            NSUserNotification::new().as_ref(),
        );
        Notification::new()
            .subtitle("asd")
            .title("aaaaaaa")
            .send()
            .unwrap()
    }
}

/// # Safety
/// - This function is not thread safe and should be called once.
/// - The provided func is not allowed to panic or unwind, it is intended to just send something on a channel or similar
pub unsafe fn add_notification_callback<F>(callback: F)
where
    F: Fn(String, NotificationResponse) + 'static,
{
}

pub fn run_main_loop_once() {
    unsafe {
        let main_loop = NSRunLoop::mainRunLoop();
        let limit_date = NSDate::dateWithTimeIntervalSinceNow(0.1);
        main_loop.runMode_beforeDate(NSDefaultRunLoopMode, &limit_date);
    }
}
