import React_RCTAppDelegate
import React

@objc(EXAppInstance)
open class ExpoAppInstance: RCTAppDelegate {
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
    print("🔍 ExpoAppInstance createRootViewController")
    // Create a basic UIViewController that will host our React Native view
    let viewController = UIViewController()
    print("🔍 Created view controller: \(viewController)")
    
    // Get the root view - use createRootView properly with a bridge
    if let bridge = RCTBridge(delegate: self, launchOptions: nil) {
      print("🔍 Created bridge: \(bridge)")
      // Note: We're using "main" here, but subclasses should override this to use the correct module name
      let rootView = createRootView(with: bridge, moduleName: "main", initialProperties: nil)
      print("🔍 Created root view: \(rootView), type: \(type(of: rootView))")
      viewController.view = rootView
    } else {
      print("❌ Failed to create RCTBridge")
    }
    
    return viewController
  }

  open override func bundleURL() -> URL? {
    let url: URL?
    #if DEBUG
    url = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
    url = Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
    print("🔍 ExpoAppInstance bundleURL: \(String(describing: url))")
    return url
  }

  @objc
  open override func createRCTRootViewFactory() -> RCTRootViewFactory {
    print("🔍 ExpoAppInstance createRCTRootViewFactory")
    let appDelegate = self.appDelegate ?? self

    let bundleUrlBlock: RCTBundleURLBlock = { [weak self] in
      let appDelegateWeak = self?.appDelegate ?? self
      let url = appDelegateWeak?.bundleURL()
      print("🔍 Bundle URL block called, returning: \(String(describing: url))")
      return url
    }

    let configuration = RCTRootViewFactoryConfiguration(
      bundleURLBlock: bundleUrlBlock,
      newArchEnabled: newArchEnabled(),
      turboModuleEnabled: turboModuleEnabled(),
      bridgelessEnabled: bridgelessEnabled()
    )

    print("🔍 Created RCTRootViewFactoryConfiguration with newArch: \(newArchEnabled()), turboModule: \(turboModuleEnabled()), bridgeless: \(bridgelessEnabled())")

    configuration.createRootViewWithBridge = { bridge, moduleName, initProps in
      print("🔍 createRootViewWithBridge called with moduleName: \(moduleName ?? "nil")")
      return appDelegate.createRootView(with: bridge, moduleName: moduleName, initProps: initProps)
    }

    configuration.createBridgeWithDelegate = { delegate, launchOptions in
      print("🔍 createBridgeWithDelegate called")
      return appDelegate.createBridge(with: delegate, launchOptions: launchOptions)
    }

    configuration.customizeRootView = { rootView in
      print("🔍 customizeRootView called with view type: \(type(of: rootView))")
      if let rootView = rootView as? RCTRootView {
        return self.customize(rootView)
      }
      return rootView
    }

    // NOTE(kudo): `sourceURLForBridge` is not referenced intentionally because it does not support New Architecture.
    configuration.sourceURLForBridge = nil

    if responds(to: #selector(extraModules(for:))) {
      print("🔍 Setting up extraModulesForBridge")
      configuration.extraModulesForBridge = { bridge in
        return appDelegate.extraModules(for: bridge)
      }
    }

    if responds(to: #selector(extraLazyModuleClasses(for:))) {
      print("🔍 Setting up extraLazyModuleClassesForBridge")
      configuration.extraLazyModuleClassesForBridge = { bridge in
        return appDelegate.extraLazyModuleClasses(for: bridge)
      }
    }

    if responds(to: #selector(bridge(_:didNotFindModule:))) {
      print("🔍 Setting up bridgeDidNotFindModule")
      configuration.bridgeDidNotFindModule = { bridge, moduleName in
        print("🔍 bridgeDidNotFindModule called for module: \(moduleName)")
        return appDelegate.bridge(bridge, didNotFindModule: moduleName)
      }
    }

    let factory = RCTRootViewFactory(configuration: configuration)
    print("🔍 Created RCTRootViewFactory: \(factory)")
    return factory
  }

  open override func sourceURL(for bridge: RCTBridge) -> URL? {
    // This method is called only in the old architecture. For compatibility just use the result of a new `bundleURL` method.
    let url = bundleURL()
    print("🔍 sourceURL called for bridge, returning: \(String(describing: url))")
    return url
  }
  
  // Custom method to customize RCTRootView
  open func customize(_ rootView: RCTRootView) -> RCTRootView {
    print("🔍 customize called for RCTRootView")
    // Add any customization you need directly here
    return rootView
  }
}
