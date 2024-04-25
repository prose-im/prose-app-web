#import <Foundation/Foundation.h>
#import <objc/runtime.h>


typedef void (*NotificationCallback)(NSString* identifier, NSDictionary* event);
NotificationCallback notificationCallback = nil;

// Define a class that conforms to the NSUserNotificationCenterDelegate protocol
@interface NotificationCenterDelegate: NSObject <NSUserNotificationCenterDelegate>
@end

@implementation NotificationCenterDelegate

// Implement the delegate method to handle the user's response to the notification
- (void)userNotificationCenter:(NSUserNotificationCenter *)center didActivateNotification:(NSUserNotification *)notification {
    NSLog(@"Notification activated");
    NSDictionary* actionData;
    // Handle the user's response to the notification here
    switch (notification.activationType) {
        case NSUserNotificationActivationTypeReplied: {
            actionData = @{@"activationType": @"replied", @"activationValue": notification.response.string};
            break;
        }
        case NSUserNotificationActivationTypeContentsClicked: {
            actionData = @{@"activationType": @"contentsClicked"};
            break;
        }
        default: {
            actionData = @{@"activationType": @"none"};
            break;
        }
    }


    [center removeDeliveredNotification:notification];
}

@end

NotificationCenterDelegate * notificationHandler = nil;



#pragma mark - Swizzle NSBundle

NSString *fakeBundleIdentifier = nil;

@implementation NSBundle(swizle)

// Overriding bundleIdentifier works, but overriding NSUserNotificationAlertStyle does not work.

- (NSString *)__bundleIdentifier
{
    if (self == [NSBundle mainBundle]) {
        return fakeBundleIdentifier ? fakeBundleIdentifier : @"com.apple.finder";
    } else {
        return [self __bundleIdentifier];
    }
}

@end

BOOL installNSBundleHook()
{
    Class class = objc_getClass("NSBundle");
    if (class) {
        method_exchangeImplementations(class_getInstanceMethod(class, @selector(bundleIdentifier)),
                                       class_getInstanceMethod(class, @selector(__bundleIdentifier)));
        return YES;
    }
	return NO;
}



void init(NSString* appName) {
    @autoreleasepool {
        NSString* findString = [NSString stringWithFormat:@"get id of application \"%@\"", appName];
        NSAppleScript* findScript = [[NSAppleScript alloc] initWithSource:findString];
        NSAppleEventDescriptor* resultDescriptor = [findScript executeAndReturnError:nil];

        NSString *newbundleIdentifier = [resultDescriptor stringValue];

        if (installNSBundleHook()) {
            if (LSCopyApplicationURLsForBundleIdentifier((CFStringRef)newbundleIdentifier, NULL) != NULL) {
                [fakeBundleIdentifier release]; // Release old value - nil is ok
                fakeBundleIdentifier = newbundleIdentifier;
                [newbundleIdentifier retain]; // Retain new value - it outlives this scope
            }
        }
    }
}
