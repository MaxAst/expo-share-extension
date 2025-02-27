#import "RCTShareView.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTUtils.h>
#import <React/RCTConstants.h>
#import <ReactCommon/RCTTurboModuleManager.h>

@implementation RCTShareView

+ (RCTRootViewFactory *)createRootViewFactory {
    NSLog(@"📱 [ShareView] Starting root view factory creation");
    
    RCTBundleURLBlock bundleURLBlock = ^NSURL *{
#if DEBUG
        NSLog(@"🔍 [ShareView] Creating debug bundle URL");
        RCTBundleURLProvider *settings = [RCTBundleURLProvider sharedSettings];
        settings.enableDev = YES;
        settings.enableMinification = NO;
    
        NSLog(@"🔍 [ShareView] Attempting to create bundle URL for share extension");
        NSURL *bundleURL = [settings jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
        
        if (bundleURL) {
            NSLog(@"✅ [ShareView] Bundle URL created: %@", bundleURL);
            NSURLComponents *components = [[NSURLComponents alloc] initWithURL:bundleURL resolvingAgainstBaseURL:NO];
            NSMutableArray *queryItems = [NSMutableArray arrayWithArray:components.queryItems ?: @[]];
            [queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"shareExtension" value:@"true"]];
            components.queryItems = queryItems;
            return components.URL ?: bundleURL;
        }
        NSLog(@"❌ [ShareView] Could not create bundle URL");
        @throw [NSException exceptionWithName:@"BundleNotFound" reason:@"Could not create bundle URL" userInfo:nil];
#else
        NSLog(@"🔍 [ShareView] Creating release bundle URL");
        NSURL *bundleURL = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
        if (!bundleURL) {
            NSLog(@"❌ [ShareView] Could not load bundle URL");
            @throw [NSException exceptionWithName:@"BundleNotFound" reason:@"Could not load bundle URL" userInfo:nil];
        }
        return bundleURL;
#endif
    };

    // Enable key flags for turbo modules
    RCTEnableTurboModuleInterop(YES);
    RCTEnableTurboModuleInteropBridgeProxy(YES);
    
    NSLog(@"🔧 [ShareView] Configuring root view factory");
    RCTRootViewFactoryConfiguration *configuration = [[RCTRootViewFactoryConfiguration alloc]
        initWithBundleURLBlock:bundleURLBlock
            newArchEnabled:YES
            turboModuleEnabled:YES
            bridgelessEnabled:YES];

    NSLog(@"👷 [ShareView] Creating turbo module delegate");
    RCTTurboModuleDelegateImpl *turboDelegate = [[RCTTurboModuleDelegateImpl alloc] init];
    
    NSLog(@"🏗 [ShareView] Creating root view factory");
    RCTRootViewFactory *factory = [[RCTRootViewFactory alloc]
        initWithTurboModuleDelegate:turboDelegate
                       hostDelegate:turboDelegate
                     configuration:configuration];
        
    if (factory) {
        NSLog(@"✅ [ShareView] Root view factory created successfully");
    } else {
        NSLog(@"❌ [ShareView] Failed to create root view factory");
    }
    
    return factory;
}

@end
