use objc2_foundation::{NSDictionary, NSString};
use std::ops::Deref;
use objc2::rc::autoreleasepool;

/// Response from the Notification
#[derive(Debug)]
pub enum NotificationResponse {
    /// No interaction has occured
    None,
    /// User clicked on an action button with the given name
    ActionButton(String),
    /// User clicked on the close button with the given name
    CloseButton(String),
    /// User clicked the notification directly
    Click,
    /// User submitted text to the input text field
    Reply(String),
}

impl NotificationResponse {
    /// Create a NotificationResponse from the given Objective C NSDictionary
    pub(crate) fn from_dictionary(dictionary: &NSDictionary<NSString, NSString>) -> Self {
        let (action, value) = autoreleasepool(|pool| {
            let activation_value = NSString::from_str("activationValue");
            let activation_type = NSString::from_str("activationType");

            let activation_value = unsafe {
                    dictionary
                        .objectForKey(activation_value.deref())
                        .map(|str| str.as_str(pool).to_owned())
            };
            let activation_type = unsafe {
                    dictionary
                        .objectForKey(activation_type.deref())
                        .map(|str| str.as_str(pool).to_owned())
            };
            (activation_type, activation_value)
        });
        match action.as_deref() {
            Some("actionClicked") => Self::ActionButton(value.unwrap_or_else(|| "".to_string())),
            Some("replied") => Self::Reply(value.unwrap_or_else(|| "".to_string())),
            Some("contentsClicked") => Self::Click,

            _ => unreachable!("Unknown notification response: {:?}", dictionary),
        }
    }
}

