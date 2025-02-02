//
//  RCTShareView.m
//  basicShareExtension
//
//  Created by Maximilian Ast on 01.02.25.
//

#import "RCTShareView.h"
#import <React/RCTBundleURLProvider.h>

@implementation RCTShareView

+ (RCTRootViewFactory *)createRootViewFactory {
  RCTBundleURLBlock bundleURLBlock = ^NSURL *{
#if DEBUG
        RCTBundleURLProvider *settings = [RCTBundleURLProvider sharedSettings];
        settings.enableDev = YES;
        settings.enableMinification = NO;
    
        NSLog(@"🔍 Attempting to create bundle URL for share extension");
        NSURL *bundleURL = [settings jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
        
        if (bundleURL) {
            NSLog(@"✅ Bundle URL created: %@", bundleURL);
            NSURLComponents *components = [[NSURLComponents alloc] initWithURL:bundleURL resolvingAgainstBaseURL:NO];
            NSMutableArray *queryItems = [NSMutableArray arrayWithArray:components.queryItems ?: @[]];
            [queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"shareExtension" value:@"true"]];
            components.queryItems = queryItems;
            return components.URL ?: bundleURL;
        }
        @throw [NSException exceptionWithName:@"BundleNotFound" reason:@"Could not create bundle URL" userInfo:nil];
#else
        NSURL *bundleURL = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
        if (!bundleURL) {
            @throw [NSException exceptionWithName:@"BundleNotFound" reason:@"Could not load bundle URL" userInfo:nil];
        }
        return bundleURL;
#endif
    };
    
    RCTRootViewFactoryConfiguration *configuration = [[RCTRootViewFactoryConfiguration alloc]
        initWithBundleURLBlock:bundleURLBlock
                newArchEnabled:YES
            turboModuleEnabled:YES
             bridgelessEnabled:YES];
  
    return [[RCTRootViewFactory alloc] initWithConfiguration:configuration];
}

@end
