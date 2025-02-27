#import "RCTTurboModuleDelegateImpl.h"
#import <React/CoreModulesPlugins.h>
#import <react/nativemodule/defaults/DefaultTurboModules.h>

@implementation RCTTurboModuleDelegateImpl

- (Class)getModuleClassFromName:(const char *)name {
    NSString *moduleName = [NSString stringWithUTF8String:name];
    NSLog(@"🔍 [TurboDelegate] Looking up module class for: %@", moduleName);
    
#if RN_DISABLE_OSS_PLUGIN_HEADER
    Class moduleClass = RCTTurboModulePluginClassProvider(name);
#else
    Class moduleClass = RCTCoreModulesClassProvider(name);
#endif

    if (moduleClass) {
        NSLog(@"✅ [TurboDelegate] Found module class: %@", NSStringFromClass(moduleClass));
    }
    
    return moduleClass;
}

- (id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass
{
    NSLog(@"🔍 [TurboDelegate] Creating module instance for class: %@", NSStringFromClass(moduleClass));
    return RCTAppSetupDefaultModuleFromClass(moduleClass);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                     initParams:(const facebook::react::ObjCTurboModule::InitParams &)params
{
    NSString *moduleName = [NSString stringWithUTF8String:name.c_str()];
    NSLog(@"🔍 [TurboDelegate] Getting turbo module with params for: %@", moduleName);
    return std::make_shared<facebook::react::ObjCTurboModule>(params);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                      jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker
{
    NSString *moduleName = [NSString stringWithUTF8String:name.c_str()];
    NSLog(@"🔍 [TurboDelegate] Getting turbo module for: %@", moduleName);
    return facebook::react::DefaultTurboModules::getTurboModule(name, jsInvoker);
}

#pragma mark - RCTHostDelegate

- (void)hostDidStart:(RCTHost *)host {
    NSLog(@"📱 [TurboDelegate] Host did start");
}

- (void)host:(RCTHost *)host didReceiveJSErrorStack:(NSArray<NSDictionary<NSString *, id> *> *)stack
    message:(NSString *)message
    exceptionId:(NSUInteger)exceptionId
    isFatal:(BOOL)isFatal {
    NSLog(@"❌ [TurboDelegate] JS Error: %@", message);
}

#pragma mark - RCTTurboModuleManagerRuntimeHandler

- (facebook::react::RuntimeExecutor)runtimeExecutorForTurboModuleManager:(RCTTurboModuleManager *)turboModuleManager {
    NSLog(@"🔄 [TurboDelegate] Getting runtime executor for turbo module manager");
    return ^(std::function<void(facebook::jsi::Runtime &)> &&callback) {
        callback(*reinterpret_cast<facebook::jsi::Runtime *>(0x1));
    };
}

@end
