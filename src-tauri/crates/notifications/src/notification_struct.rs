use std::fmt::Debug;
use objc2::__framework_prelude::Id;
use objc2::{ClassType, msg_send};
use objc2_app_kit::NSImage;
use objc2_foundation::{NSError, NSString, NSURL, NSUserNotification, NSUserNotificationCenter};
use uuid::Uuid;

#[derive(Debug, Clone, Default)]
pub struct Notification {
    /// The unique identifier for the notification.
    identifier: String,
    /// The localized text that provides the notification’s primary description.
    title: Option<String>,
    /// The localized text that provides the notification’s secondary description.
    subtitle: Option<String>,
    /// launches because of the notification.
    image: Option<String>,
    /// The sound that plays when the system delivers the notification.
    sound: Option<String>,
    /// Has reply button
    reply: bool,
}

impl Notification {
    pub fn send(self) -> Result<(), NotificationError> {
        unsafe {
            let notification = NSUserNotification::new();

            let identifier = Uuid::new_v4().to_string();

            let ns_str = NSString::from_str(identifier.as_str());
            notification.setIdentifier(Some(&ns_str));

            if let Some(title) = self.title {
                let ns_str = NSString::from_str(&title);
                notification.setTitle(Some(&ns_str));
            }

            if let Some(subtitle) = self.subtitle {
                let ns_str = NSString::from_str(&subtitle);
                notification.setSubtitle(Some(&ns_str));
            }
            if let Some(sound) = self.sound {
               let ns_str = NSString::from_str(&sound);
                notification.setSoundName(Some(&ns_str));
            }


            if let Some(image) = self.image {
                let ns_str = NSString::from_str(&image);
                let ns_url = NSURL::URLWithString(&ns_str).unwrap();
                let ns_image = NSImage::initWithContentsOfURL(NSImage::alloc(), &ns_url).unwrap();
                let _: () = msg_send![notification.as_ref(), setContentImage:ns_image.as_ref()];
            }

            if self.reply {
                notification.setHasReplyButton(self.reply);
            }


            let notification_center = NSUserNotificationCenter::defaultUserNotificationCenter();
            notification_center.deliverNotification(&notification);

            Ok(())
        }
    }
}

impl Notification {
    pub fn new() -> Self {
        Self::default()
    }
    pub fn title(mut self, title: &str) -> Self {
        self.title = Some(title.to_string());
        self
    }

    pub fn subtitle(mut self, subtitle: &str) -> Self {
        self.subtitle = Some(subtitle.to_string());
        self
    }

    pub fn image(mut self, image: &str) -> Self {
        self.image = Some(image.to_string());
        self
    }

    pub fn sound(mut self, sound: &str) -> Self {
        self.sound = Some(sound.to_string());
        self
    }

    pub fn reply(mut self, reply: bool) -> Self {
        self.reply = reply;
        self
    }

}

#[derive(Clone)]
pub enum NotificationError {
    /// Error from the Objective C User Notifications framework
    NSError(Id<NSError>),
    /// Not supported for the current OS version
    NotSupported,
}

impl From<Id<NSError>> for NotificationError {
    fn from(value: Id<NSError>) -> Self {
        Self::NSError(value)
    }
}

impl Debug for NotificationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            NotificationError::NSError(ns_error) => {
                f.debug_struct("NSError")
                    .field("code", &ns_error.code())
                    .field("domain", &ns_error.domain().to_string())
                    .field("message", &ns_error.localizedDescription().to_string())
                    .finish()
            },
            NotificationError::NotSupported => {
                f.write_str("NotSupported")
            }
        }
    }
}