//
//  RCTTurboModuleDelegateImpl.h
//  basicShareExtension
//
//  Created by Maximilian Ast on 02.02.25.
//

#import <React_RCTAppDelegate/React-RCTAppDelegate-umbrella.h>
#import <ReactCommon/RCTTurboModule.h>
#import <ReactCommon/RCTHost.h>
#import <ReactCommon/RCTTurboModuleManager.h>

NS_ASSUME_NONNULL_BEGIN

@interface RCTTurboModuleDelegateImpl : NSObject <RCTTurboModuleManagerDelegate, RCTHostDelegate, RCTTurboModuleManagerRuntimeHandler>
@end

NS_ASSUME_NONNULL_END
