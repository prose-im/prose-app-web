// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

#![cfg(target_os = "macos")]
#![allow(improper_ctypes)]

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

mod notification;

use objc_foundation::{INSString, NSDictionary};
use objc_foundation::NSString;
use std::ops::Deref;
use crate::notification::NotificationResponse;


/**************************************************************************
 * MODULES
 * ************************************************************************* */
mod sys {
    use objc_foundation::{NSDictionary, NSString};
    use objc_id::Id;

    #[link(name = "helper")]
    extern "C" {
        pub fn makeDownloadBounce(filename: *const NSString);
    }
    
    #[link(name = "notification")]
    extern "C" {
        pub fn send_notification(title: *const NSString, message: *const NSString) -> Id<NSString>;
    }
    #[link(name = "notification")]
    extern "C" {
        pub fn init(app_name: *const NSString, callback: extern "C" fn(identifier: *const NSString, event: *const NSDictionary<NSString, NSString>));
    }
}

/**************************************************************************
 * METHODS
 * ************************************************************************* */

extern "C" fn notification_callback(identifier: *const NSString, event: *const NSDictionary<NSString, NSString>) {
    let identifier = match unsafe { identifier.as_ref() } {
        Some(identifier) => identifier.as_str().to_owned(),
        None => return,
    };
    let event = match unsafe { event.as_ref() } {
        Some(event) => event,
        None => return,
    };

    let response = NotificationResponse::from_dictionary(event);
    println!("callback is called, value passed = {:?}, {:?}", response, identifier);
}

pub fn init(app_name: &str) {
    let app_name = NSString::from_str(app_name);
    let app_name = app_name.deref();

    unsafe {
        sys::init(app_name, notification_callback);
    }
}


pub fn make_download_bounce(filename: &str) {
    let binding = NSString::from_str(filename);
    let filename = binding.deref();
    
    unsafe {
        sys::makeDownloadBounce(filename);
    }
}

pub fn send_notification(title: &str, message: &str) -> String {
    let title = NSString::from_str(title);
    let message = NSString::from_str(message);

    let id = unsafe {
        sys::send_notification(title.deref(), message.deref())
    };
    id.as_str().to_owned()
}