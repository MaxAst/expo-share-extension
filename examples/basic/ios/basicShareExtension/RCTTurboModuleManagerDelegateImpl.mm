//
//  RCTTurboModuleManagerDelegateImpl.mm
//  basicShareExtension
//
//  Created by Maximilian Ast on 31.01.25.
//

#if defined(__cplusplus)
#import <ReactCommon/RCTTurboModule.h>
#import <react/nativemodule/defaults/DefaultTurboModules.h>
#endif

#if RN_DISABLE_OSS_PLUGIN_HEADER
#import <RCTTurboModulePlugin/RCTTurboModulePlugin.h>
#else
#import <React/CoreModulesPlugins.h>
#endif

#import "RTCAppDelegateUmbrella.h"
#import "RCTTurboModuleManagerDelegateImpl.h"

@implementation RCTTurboModuleManagerDelegateImpl

- (Class)getModuleClassFromName:(const char *)name
{
#if RN_DISABLE_OSS_PLUGIN_HEADER
  return RCTTurboModulePluginClassProvider(name);
#else
  return RCTCoreModulesClassProvider(name);
#endif
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                      jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker
{
  return facebook::react::DefaultTurboModules::getTurboModule(name, jsInvoker);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                     initParams:
                                                         (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return nullptr;
}

- (id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass
{
  return RCTAppSetupDefaultModuleFromClass(moduleClass);
}

@end
