#![cfg(target_os = "macos")]
#![allow(improper_ctypes)]

use objc_foundation::INSString;
use objc_foundation::NSString;
use std::ops::Deref;
mod sys {
    use objc_foundation::NSString;
    #[link(name = "helper")]
    extern "C" {
        pub fn makeDownloadBounce(filename: *const NSString);
    }
}
/// Bounce the download in the dock
/// # Example:
/// ```no_run
/// # use notifications::*;
/// make_download_bounce("/Users/.../Downloads/test.txt");
/// ```
/// # Note:
/// This function is only available on macOS
pub fn make_download_bounce(filename: &str) {
    let binding = NSString::from_str(filename);
    let filename = binding.deref();

    unsafe {
        sys::makeDownloadBounce(filename);
    }
}
