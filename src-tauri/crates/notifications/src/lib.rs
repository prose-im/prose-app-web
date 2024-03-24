// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

#![cfg(target_os = "macos")]
#![allow(improper_ctypes)]

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use objc_foundation::INSString;
use objc_foundation::NSString;
use std::ops::Deref;

/**************************************************************************
 * MODULES
 * ************************************************************************* */

mod sys {
    use objc_foundation::NSString;

    #[link(name = "helper")]
    extern "C" {
        pub fn makeDownloadBounce(filename: *const NSString);
    }
}

/**************************************************************************
 * METHODS
 * ************************************************************************* */

pub fn make_download_bounce(filename: &str) {
    let binding = NSString::from_str(filename);
    let filename = binding.deref();

    unsafe {
        sys::makeDownloadBounce(filename);
    }
}
