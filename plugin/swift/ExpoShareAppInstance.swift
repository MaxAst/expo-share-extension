import React_RCTAppDelegate
import React

@objc(EXShareAppInstance)
open class ExpoShareAppInstance: RCTAppDelegate {
  /**
   When using AppDelegate.mm which does not inherit ExpoAppInstance directly,
   we pass an appDelegate to allow execute functions upon the true AppDelegate.
   */
  private weak var appDelegate: RCTAppDelegate?

  @objc
  public convenience init(appDelegate: RCTAppDelegate) {
    print("🔍 ExpoAppInstance init with appDelegate")
    self.init()
    self.appDelegate = appDelegate
  }

  @objc
  open override func createRootViewController() -> UIViewController {
    let viewController = UIViewController()
    print("🔍 ExpoAppInstance creating view controller")
    return viewController
  }

  open override func bundleURL() -> URL? {
    #if DEBUG
    let settings = RCTBundleURLProvider.sharedSettings()
    settings.enableDev = true
    settings.enableMinification = false
    let bundleURL = settings.jsBundleURL(forBundleRoot: "index.share")
    print("🔍 ExpoAppInstance creating bundle URL \(String(describing: bundleURL))")
    return bundleURL
    #else
    let bundleURL = Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    return bundleURL
    #endif
  }

  @objc
  open override func createRCTRootViewFactory() -> RCTRootViewFactory {
    print("🔍 ExpoAppInstance createRCTRootViewFactory")
    let appDelegate = self.appDelegate ?? self

    let bundleUrlBlock: RCTBundleURLBlock = { [weak self] in
      let appDelegateWeak = self?.appDelegate ?? self
      let url = appDelegateWeak?.bundleURL()
      print("🔍 ExpoAppInstance: Bundle URL block called, returning: \(String(describing: url))")
      return url
    }

    let configuration = RCTRootViewFactoryConfiguration(
      bundleURLBlock: bundleUrlBlock,
      newArchEnabled: newArchEnabled(),
      turboModuleEnabled: newArchEnabled(),
      bridgelessEnabled: newArchEnabled()
    )

    print("🔍 ExpoAppInstance: Created RCTRootViewFactoryConfiguration with newArch: \(newArchEnabled()), turboModule: \(newArchEnabled()), bridgeless: \(newArchEnabled())")

    configuration.createRootViewWithBridge = { bridge, moduleName, initProps in
      print("🔍 ExpoAppInstance: createRootViewWithBridge called with moduleName: \(moduleName)")
      return appDelegate.createRootView(with: bridge, moduleName: moduleName, initProps: initProps)
    }

    configuration.createBridgeWithDelegate = { delegate, launchOptions in
      print("🔍 ExpoAppInstance: createBridgeWithDelegate called")
      return appDelegate.createBridge(with: delegate, launchOptions: launchOptions)
    }

    configuration.customizeRootView = { rootView in
      print("🔍 ExpoAppInstance: customizeRootView called with view type: \(type(of: rootView))")
      if let rootView = rootView as? RCTRootView {
        return self.customize(rootView)
      }
    }

    configuration.sourceURLForBridge = nil

    if responds(to: #selector(extraModules(for:))) {
      print("🔍 ExpoAppInstance: Setting up extraModulesForBridge")
      configuration.extraModulesForBridge = { bridge in
        return appDelegate.extraModules(for: bridge)
      }
    }

    if responds(to: #selector(extraLazyModuleClasses(for:))) {
      print("🔍 ExpoAppInstance: Setting up extraLazyModuleClassesForBridge")
      configuration.extraLazyModuleClassesForBridge = { bridge in
        return appDelegate.extraLazyModuleClasses(for: bridge)
      }
    }

    if responds(to: #selector(bridge(_:didNotFindModule:))) {
      print("🔍 ExpoAppInstance: Setting up bridgeDidNotFindModule")
      configuration.bridgeDidNotFindModule = { bridge, moduleName in
        print("🔍 ExpoAppInstance: bridgeDidNotFindModule called for module: \(moduleName)")
        return appDelegate.bridge(bridge, didNotFindModule: moduleName)
      }
    }

    let factory = RCTRootViewFactory(configuration: configuration)
    print("🔍 ExpoAppInstance: Created RCTRootViewFactory: \(factory)")
    return factory
  }

  open override func sourceURL(for bridge: RCTBridge) -> URL? {
    // This method is called only in the old architecture. For compatibility just use the result of a new `bundleURL` method.
    let url = bundleURL()
    print("🔍 ExpoAppInstance: sourceURL called for bridge, returning: \(String(describing: url))")
    return url
  }
  
  // Custom method to customize RCTRootView
  open func customize(_ rootView: RCTRootView) -> RCTRootView {
    print("🔍 ExpoAppInstance: customize called for RCTRootView")
    // Add any customization you need directly here
    return rootView
  }
}
