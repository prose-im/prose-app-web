use objc_foundation::{INSDictionary, INSString, NSDictionary, NSString};
use std::ops::Deref;

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
        let activation_type = dictionary
            .object_for(NSString::from_str("activationType").deref())
            .map(|str| str.as_str().to_owned());

        match activation_type.as_deref() {
            Some("actionClicked") => NotificationResponse::ActionButton(
                match dictionary.object_for(NSString::from_str("activationValue").deref()) {
                    Some(str) => str.as_str().to_owned(),
                    None => String::from(""),
                },
            ),
            Some("closeClicked") => NotificationResponse::CloseButton(
                match dictionary.object_for(NSString::from_str("activationValue").deref()) {
                    Some(str) => str.as_str().to_owned(),
                    None => String::from(""),
                },
            ),
            Some("replied") => NotificationResponse::Reply(
                match dictionary.object_for(NSString::from_str("activationValue").deref()) {
                    Some(str) => str.as_str().to_owned(),
                    None => String::from(""),
                },
            ),
            Some("contentsClicked") => NotificationResponse::Click,
            _ => NotificationResponse::None,
        }
    }
}
