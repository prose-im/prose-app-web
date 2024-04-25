use objc2_app_kit::NSApplication;
use objc2_foundation::NSString;
use objc2_foundation::{MainThreadMarker, NSDistributedNotificationCenter, NSNotificationName};
use std::ops::Deref;

pub fn make_download_bounce(filename: &str) {
    unsafe {
        let notification_center = NSDistributedNotificationCenter::defaultCenter();
        let name = NSNotificationName::from_str("com.apple.DownloadFileFinished");
        let filename = NSString::from_str(filename);
        notification_center.postNotificationName_object(name.deref(), Some(filename.deref()));
    }
}
pub fn set_badge(content: Option<&str>) {
    let content = content.map(|s| NSString::from_str(s));
    let mtm = MainThreadMarker::new().expect("set_badge() must be on the main thread");
    let app = NSApplication::sharedApplication(mtm);
    unsafe {
        match content {
            Some(s) => app.dockTile().setBadgeLabel(Some(s.deref())),
            None => app.dockTile().setBadgeLabel(None),
        }
    }
}
