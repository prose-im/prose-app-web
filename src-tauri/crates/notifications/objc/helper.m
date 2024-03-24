#import <Foundation/Foundation.h>

void makeDownloadBounce(NSString* fileName) {
    [[NSDistributedNotificationCenter defaultCenter]
        postNotificationName:@"com.apple.DownloadFileFinished"
        object:fileName];
}
