import UIKit
import React
import React_RCTAppDelegate
import ExpoModulesCore
import AVFoundation
// switch to UniformTypeIdentifiers, once 14.0 is the minimum deploymnt target on expo (currently 13.4 in expo v50)
import MobileCoreServices
// if react native firebase is installed, we import and configure it
#if canImport(FirebaseCore)
import FirebaseCore
#endif
#if canImport(FirebaseAuth)
import FirebaseAuth
#endif

// Custom ExpoAppInstance subclass for share extension
class ShareExtensionAppInstance: ExpoAppInstance {
  public var props: [AnyHashable: Any]?
  
  init(initialProps: [AnyHashable: Any]?) {
    print("📱 ShareExtensionAppInstance init with props: \(String(describing: initialProps))")
    self.props = initialProps
    super.init()
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  override func createRootViewController() -> UIViewController {
    print("📱 ShareExtensionAppInstance createRootViewController")
    
    // Instead of using super.createRootViewController(), create our own with the correct module name
    let viewController = UIViewController()
    print("📱 Created custom view controller for share extension")
    
    // Create a bridge with this instance as the delegate
    if let bridge = RCTBridge(delegate: self, launchOptions: [:]) {
      print("📱 Created bridge for share extension: \(bridge)")
      
      // Create a root view with the correct module name
      let rootView = RCTRootView(
        bridge: bridge,
        moduleName: "shareExtension", // Use shareExtension module name here
        initialProperties: props
      )
      print("📱 Created RCTRootView with module name 'shareExtension'")
      
      // Set the root view as the view controller's view
      viewController.view = rootView
    } else {
      print("❌ Failed to create RCTBridge for share extension")
      
      // Fallback to super implementation if bridge creation fails
      let fallbackViewController = super.createRootViewController()
      print("📱 Using fallback view controller: \(fallbackViewController)")
      
      // Try to modify the view if possible
      if let proxyView = fallbackViewController.view as? RCTSurfaceHostingProxyRootView {
        print("📱 Got RCTSurfaceHostingProxyRootView, attempting to configure")
        // For RCTSurfaceHostingProxyRootView, we need to create a new surface with the correct module name
        if let bridge = RCTBridge.current() {
          print("📱 Using current bridge to create surface")
          let surface = RCTSurface(bridge: bridge, moduleName: "shareExtension", initialProperties: props ?? [:])
          // Since we can't set the surface directly, we'll try to create a new view with the surface
          let newProxyView = RCTSurfaceHostingProxyRootView(surface: surface)
          fallbackViewController.view = newProxyView
          print("📱 Created new view with surface for module name 'shareExtension'")
        }
      }
      
      return fallbackViewController
    }
    
    return viewController
  }
  
  override func bundleURL() -> URL? {
    let url: URL?
    #if DEBUG
    // Make sure to load the index.share.js bundle instead of index.js
    url = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index.share")
    #else
    // For release builds, we need to make sure the correct bundle is used
    if let mainBundle = Bundle.main.url(forResource: "main.share", withExtension: "jsbundle") {
      url = mainBundle
    } else {
      // Fallback to the main bundle if share bundle doesn't exist
      url = Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    }
    #endif
    print("📱 ShareExtensionAppInstance bundleURL: \(String(describing: url))")
    return url
  }
}

class ShareExtensionViewController: UIViewController {
  private weak var rootView: UIView?
  private let loadingIndicator = UIActivityIndicatorView(style: .large)
  private var expoAppInstance: ShareExtensionAppInstance?
  private var reactViewController: UIViewController?
  
  deinit {
    print("🧹 ShareExtensionViewController deinit")
    cleanupAfterClose()
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    print("📱 ShareExtensionViewController viewWillDisappear, isBeingDismissed: \(isBeingDismissed)")
    // Start cleanup earlier to ensure proper surface teardown
    if isBeingDismissed {
      cleanupAfterClose()
    }
  }
  
  override func viewDidLoad() {
    super.viewDidLoad()
    print("📱 ShareExtensionViewController viewDidLoad")
    setupLoadingIndicator()
    
#if canImport(FirebaseCore)
    if Bundle.main.object(forInfoDictionaryKey: "WithFirebase") as? Bool ?? false {
      print("📱 Configuring Firebase")
      FirebaseApp.configure()
    }
#endif
    
    // Check if the shareExtension module is registered
    print("📱 Checking if 'shareExtension' module is registered in React Native")
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
      if let bridge = RCTBridge.current() {
        print("📱 Current bridge: \(bridge)")
        
        // List registered JavaScript modules
        print("📱 Checking registered JavaScript modules")
        if let modules = bridge.value(forKey: "_moduleDataByName") as? [String: Any] {
          print("📱 Available modules in bridge:")
          let hasShareExtension = modules["shareExtension"] != nil
          print("📱 'shareExtension' module exists: \(hasShareExtension)")
          
          for (moduleName, _) in modules {
            print("📱   - \(moduleName)")
          }
        } else {
          print("❌ Could not access modules list")
        }
      } else {
        print("❌ No current RCTBridge available to check modules")
      }
    }
    
    loadReactNativeContent()
    setupNotificationCenterObserver()
  }
  
  override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    print("📱 ShareExtensionViewController viewDidDisappear")
    // we need to clean up when the view is closed via a swipe
    cleanupAfterClose()
  }
  
  func close() {
    print("📱 ShareExtensionViewController close() called")
    self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    // we need to clean up when the view is closed via the close() method in react native
    cleanupAfterClose()
  }
  
  private func setupLoadingIndicator() {
    print("📱 Setting up loading indicator")
    view.addSubview(loadingIndicator)
    loadingIndicator.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      loadingIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      loadingIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
    ])
    loadingIndicator.startAnimating()
  }
  
  private func openHostApp(path: String?) {
    print("📱 Opening host app with path: \(String(describing: path))")
    guard let scheme = Bundle.main.object(forInfoDictionaryKey: "HostAppScheme") as? String else { 
      print("❌ Failed to get HostAppScheme from Info.plist")
      return 
    }
    var urlComponents = URLComponents()
    urlComponents.scheme = scheme
    urlComponents.host = ""
    
    if let path = path {
      let pathComponents = path.split(separator: "?", maxSplits: 1)
      let pathWithoutQuery = String(pathComponents[0])
      let queryString = pathComponents.count > 1 ? String(pathComponents[1]) : nil
      
      // Parse and set query items
      if let queryString = queryString {
        let queryItems = queryString.split(separator: "&").map { queryParam -> URLQueryItem in
          let paramComponents = queryParam.split(separator: "=", maxSplits: 1)
          let name = String(paramComponents[0])
          let value = paramComponents.count > 1 ? String(paramComponents[1]) : nil
          return URLQueryItem(name: name, value: value)
        }
        urlComponents.queryItems = queryItems
      }
      
      let pathWithSlashEnsured = pathWithoutQuery.hasPrefix("/") ? pathWithoutQuery : "/\(pathWithoutQuery)"
      urlComponents.path = pathWithSlashEnsured
    }
    
    guard let url = urlComponents.url else { 
      print("❌ Failed to create URL from components")
      return 
    }
    print("📱 Opening URL: \(url)")
    openURL(url)
    self.close()
  }
  
  @objc @discardableResult private func openURL(_ url: URL) -> Bool {
    print("📱 Attempting to open URL: \(url)")
    var responder: UIResponder? = self
    while responder != nil {
      if let application = responder as? UIApplication {
        if #available(iOS 18.0, *) {
          print("📱 Opening URL with iOS 18+ method")
          application.open(url, options: [:], completionHandler: nil)
          return true
        } else {
          print("📱 Opening URL with pre-iOS 18 method")
          return application.perform(#selector(UIApplication.open(_:options:completionHandler:)), with: url, with: [:]) != nil
        }
      }
      responder = responder?.next
    }
    print("❌ Failed to find UIApplication to open URL")
    return false
  }
  
  private func loadReactNativeContent() {
    print("📱 Loading React Native content")
    getShareData { [weak self] sharedData in
      guard let self = self else {
        print("❌ Self was deallocated during getShareData")
        return
      }
      
      print("📱 Got shared data: \(String(describing: sharedData))")
      
      // Create ExpoAppInstance with initial props
      self.expoAppInstance = ShareExtensionAppInstance(initialProps: sharedData)
      print("📱 Created ShareExtensionAppInstance: \(String(describing: self.expoAppInstance))")
      
      // Create the root view controller using ExpoAppInstance
      self.reactViewController = self.expoAppInstance?.createRootViewController()
      
      if let reactViewController = self.reactViewController {
        print("📱 Created React view controller: \(type(of: reactViewController))")
        
        // Add the React view controller as a child view controller
        self.addChild(reactViewController)
        print("📱 Added React view controller as child")
        
        // Get the root view from the view controller
        guard let rootView = reactViewController.view else {
          print("❌ React view controller's view is nil")
          return
        }
        print("📱 Root view type: \(type(of: rootView)), frame: \(rootView.frame)")
        
        // Check if the view has a React component
        if let rctView = rootView as? RCTRootView {
          print("📱 RCTRootView details - Module name: \(rctView.moduleName ?? "nil"), Bridge: \(String(describing: rctView.bridge))")
        } else if let proxyView = rootView as? RCTSurfaceHostingProxyRootView {
          print("📱 RCTSurfaceHostingProxyRootView details - Surface: \(proxyView.surface)")
        }
        
        // Configure and add the root view
        self.rootView = rootView
        self.configureRootView(rootView, withBackgroundColorDict: nil, withHeight: nil)
        
        // Complete the view controller containment
        reactViewController.didMove(toParent: self)
        print("📱 React view controller added as child")
        
        // Print view hierarchy for debugging
        print("📱 View hierarchy after adding React view:")
        self.printViewHierarchy(self.view, level: 0)
        
        // Hide loading indicator
        self.loadingIndicator.stopAnimating()
        self.loadingIndicator.isHidden = true
      } else {
        print("❌ Failed to create React view controller")
      }
    }
  }
  
  // Helper method to print view hierarchy
  private func printViewHierarchy(_ view: UIView, level: Int) {
    let indent = String(repeating: "  ", count: level)
    print("\(indent)📱 \(type(of: view)) - \(view.frame)")
    
    for subview in view.subviews {
      printViewHierarchy(subview, level: level + 1)
    }
  }
  
  private func setupNotificationCenterObserver() {
    print("📱 Setting up notification center observers")
    NotificationCenter.default.addObserver(forName: NSNotification.Name("close"), object: nil, queue: nil) { [weak self] _ in
      print("📱 Received 'close' notification")
      DispatchQueue.main.async {
        self?.close()
      }
    }
    
    NotificationCenter.default.addObserver(forName: NSNotification.Name("openHostApp"), object: nil, queue: nil) { [weak self] notification in
      print("📱 Received 'openHostApp' notification")
      DispatchQueue.main.async {
        if let userInfo = notification.userInfo {
          if let path = userInfo["path"] as? String {
            print("📱 Opening host app with path from notification: \(path)")
            self?.openHostApp(path: path)
          }
        }
      }
    }
  }
  
  private func cleanupAfterClose() {
    print("📱 Cleaning up after close")
    // Clean up notification observers first
    NotificationCenter.default.removeObserver(self)
    
    // Remove the React view controller from the parent
    reactViewController?.willMove(toParent: nil)
    reactViewController?.view.removeFromSuperview()
    reactViewController?.removeFromParent()
    reactViewController = nil
    
    // Clean up properties based on view type
    if let rctView = rootView as? RCTRootView {
      print("📱 Cleaning up RCTRootView")
      rctView.appProperties = nil
    } else if let proxyView = rootView as? RCTSurfaceHostingProxyRootView {
      print("📱 Cleaning up RCTSurfaceHostingProxyRootView")
      proxyView.appProperties = [:]
    }
    
    rootView?.removeFromSuperview()
    rootView = nil
    
    // Clean up ExpoAppInstance
    expoAppInstance = nil
    print("📱 Cleanup complete")
  }
  
  private func configureRootView(_ rootView: UIView, withBackgroundColorDict dict: [String: CGFloat]?, withHeight: CGFloat?) {
    print("📱 Configuring root view")
    rootView.backgroundColor = backgroundColor(from: dict)
    
    // Get the screen bounds and scale
    let screen = UIScreen.main
    let screenBounds = screen.bounds
    let screenScale = screen.scale
    
    // Calculate proper frame
    let frame: CGRect
    if let withHeight = withHeight {
      frame = CGRect(
        x: 0,
        y: screenBounds.height - withHeight,
        width: screenBounds.width,
        height: withHeight
      )
      print("📱 Using custom height: \(withHeight)")
    } else {
      frame = screenBounds
      print("📱 Using full screen bounds: \(screenBounds)")
    }
    
    if let proxyRootView = rootView as? RCTSurfaceHostingProxyRootView {
      print("📱 Configuring RCTSurfaceHostingProxyRootView")
      // Set surface size in points (not pixels)
      let surfaceSize = CGSize(
        width: frame.width * screenScale,
        height: frame.height * screenScale
      )
      
      // The surface property is not optional in this version of React Native
      let surface = proxyRootView.surface
      surface.setMinimumSize(surfaceSize, maximumSize: surfaceSize)
      print("📱 Set surface size: \(surfaceSize)")
      
      // Set bounds in points
      proxyRootView.bounds = CGRect(origin: .zero, size: frame.size)
      proxyRootView.center = CGPoint(x: frame.midX, y: frame.midY)
    } else {
      print("📱 Setting frame for regular view: \(frame)")
      rootView.frame = frame
    }
    
    rootView.translatesAutoresizingMaskIntoConstraints = false
    self.view.addSubview(rootView)
    print("📱 Added root view to view hierarchy")
    
    NSLayoutConstraint.activate([
      rootView.leadingAnchor.constraint(equalTo: self.view.leadingAnchor),
      rootView.trailingAnchor.constraint(equalTo: self.view.trailingAnchor),
      rootView.heightAnchor.constraint(equalToConstant: frame.height)
    ])
    
    if let withHeight = withHeight {
      NSLayoutConstraint.activate([
        rootView.bottomAnchor.constraint(equalTo: self.view.bottomAnchor)
      ])
      print("📱 Anchored view to bottom")
    } else {
      NSLayoutConstraint.activate([
        rootView.topAnchor.constraint(equalTo: self.view.topAnchor)
      ])
      print("📱 Anchored view to top")
    }
    
    if withHeight == nil {
      rootView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      print("📱 Set autoresizing mask for flexible dimensions")
    }
  }
  
  private func backgroundColor(from dict: [String: CGFloat]?) -> UIColor {
    guard let dict = dict else { return .white }
    let red = dict["red"] ?? 255.0
    let green = dict["green"] ?? 255.0
    let blue = dict["blue"] ?? 255.0
    let alpha = dict["alpha"] ?? 1
    return UIColor(red: red / 255.0, green: green / 255.0, blue: blue / 255.0, alpha: alpha)
  }
  
  private func getShareData(completion: @escaping ([AnyHashable: Any]?) -> Void) {
    print("📱 Getting share data")
    guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
      print("❌ No extension items found")
      completion(nil)
      return
    }
    
    print("📱 Found \(extensionItems.count) extension items")
    
    var sharedItems: [AnyHashable: Any] = [:]
    
    let group = DispatchGroup()
    
    let fileManager = FileManager.default
    
    for (index, item) in extensionItems.enumerated() {
      print("📱 Processing extension item \(index)")
      guard let attachments = item.attachments else {
        print("❌ No attachments in item \(index)")
        continue
      }
      
      print("📱 Found \(attachments.count) attachments in item \(index)")
      
      for (attachmentIndex, provider) in attachments.enumerated() {
        print("📱 Processing attachment \(attachmentIndex) with identifiers: \(provider.registeredTypeIdentifiers)")
        
        if provider.hasItemConformingToTypeIdentifier(kUTTypeURL as String) {
          print("📱 Found URL type")
          group.enter()
          provider.loadItem(forTypeIdentifier: kUTTypeURL as String, options: nil) { (urlItem, error) in
            DispatchQueue.main.async {
              if let error = error {
                print("❌ Error loading URL: \(error)")
              }
              
              if let sharedURL = urlItem as? URL {
                print("📱 Loaded URL: \(sharedURL)")
                if sharedURL.isFileURL {
                  print("📱 URL is a file URL")
                  if sharedItems["files"] == nil {
                    sharedItems["files"] = [String]()
                  }
                  if var fileArray = sharedItems["files"] as? [String] {
                    fileArray.append(sharedURL.absoluteString)
                    sharedItems["files"] = fileArray
                  }
                } else {
                  print("📱 URL is a web URL")
                  sharedItems["url"] = sharedURL.absoluteString
                }
              } else {
                print("❌ URL item is nil or not a URL: \(String(describing: urlItem))")
              }
              group.leave()
            }
          }
        } else if provider.hasItemConformingToTypeIdentifier(kUTTypePropertyList as String) {
          print("📱 Found property list type")
          group.enter()
          provider.loadItem(forTypeIdentifier: kUTTypePropertyList as String, options: nil) { (item, error) in
            DispatchQueue.main.async {
              if let itemDict = item as? NSDictionary,
                 let results = itemDict[NSExtensionJavaScriptPreprocessingResultsKey] as? NSDictionary {
                sharedItems["preprocessingResults"] = results
                print("📱 Got preprocessing results: \(results)")
              }
              group.leave()
            }
          }
        } else if provider.hasItemConformingToTypeIdentifier(kUTTypeText as String) {
          print("📱 Found text type")
          group.enter()
          provider.loadItem(forTypeIdentifier: kUTTypeText as String, options: nil) { (textItem, error) in
            DispatchQueue.main.async {
              if let text = textItem as? String {
                print("📱 Got text: \(text)")
                sharedItems["text"] = text
              } else {
                print("❌ Text item is nil or not a String: \(String(describing: textItem))")
              }
              group.leave()
            }
          }
        } else if provider.hasItemConformingToTypeIdentifier(kUTTypeImage as String) {
          print("📱 Found image type")
          // Rest of the image handling code...
        } else if provider.hasItemConformingToTypeIdentifier(kUTTypeMovie as String) {
          print("📱 Found movie type")
          // Rest of the movie handling code...
        }
      }
    }
    
    group.notify(queue: .main) {
      print("📱 All share data processed, items: \(sharedItems.keys)")
      completion(sharedItems.isEmpty ? nil : sharedItems)
    }
  }
}
