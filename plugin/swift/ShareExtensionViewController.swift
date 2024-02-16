import UIKit
import React
import MobileCoreServices

class ShareExtensionViewController: UIViewController {
  
  private static var sharedBridge: RCTBridge?
  private weak var rootView: RCTRootView?
  private let loadingIndicator = UIActivityIndicatorView(style: .large)
  
  override func viewDidLoad() {
    super.viewDidLoad()
    setupLoadingIndicator()
    initializeReactNativeBridgeIfNeeded()
    loadReactNativeContent()
    setupNotificationCenterObserver()
  }
  
  override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    // we need to clean up when the view is closed via a swipe
    cleanupAfterClose()
  }
  
  func close() {
    self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    // we need to clean up when the view is closed via the close() method in react native
    cleanupAfterClose()
  }
  
  private func setupLoadingIndicator() {
    view.addSubview(loadingIndicator)
    loadingIndicator.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      loadingIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      loadingIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
    ])
    loadingIndicator.startAnimating()
  }
  
  private func initializeReactNativeBridgeIfNeeded() {
    if ShareExtensionViewController.sharedBridge == nil {
      let jsCodeLocation = self.jsCodeLocation()
      ShareExtensionViewController.sharedBridge = RCTBridge(bundleURL: jsCodeLocation, moduleProvider: nil, launchOptions: nil)
    }
  }
  
  private func loadReactNativeContent() {
    getShareData { [weak self] sharedData in
      guard let self = self, let bridge = ShareExtensionViewController.sharedBridge else { return }
      
      DispatchQueue.main.async {
        if self.rootView == nil {
          let rootView = RCTRootView(bridge: bridge, moduleName: "shareExtension", initialProperties: sharedData)
          let backgroundFromInfoPlist = Bundle.main.object(forInfoDictionaryKey: "ShareExtensionBackgroundColor") as? [String: CGFloat]
          let heightFromInfoPlist = Bundle.main.object(forInfoDictionaryKey: "ShareExtensionHeight") as? CGFloat
          self.configureRootView(rootView, withBackgroundColorDict: backgroundFromInfoPlist, withHeight: heightFromInfoPlist)
          self.rootView = rootView
        } else {
          // Update existing rootView with new data
          self.rootView?.appProperties = sharedData
        }
        self.loadingIndicator.stopAnimating()
        self.loadingIndicator.removeFromSuperview()
      }
    }
  }
  
  private func setupNotificationCenterObserver() {
    NotificationCenter.default.addObserver(forName: NSNotification.Name("close"), object: nil, queue: nil) { [weak self] _ in
      DispatchQueue.main.async {
        self?.close()
      }
    }
  }
  
  private func cleanupAfterClose() {
    rootView?.removeFromSuperview()
    rootView = nil
    ShareExtensionViewController.sharedBridge?.invalidate()
    ShareExtensionViewController.sharedBridge = nil
    NotificationCenter.default.removeObserver(self)
  }
  
  private func configureRootView(_ rootView: RCTRootView, withBackgroundColorDict dict: [String: CGFloat]?, withHeight: CGFloat?) {
    rootView.backgroundColor = backgroundColor(from: dict)
    let y: CGFloat
    if let withHeight = withHeight {
        // If withHeight is set, calculate y so the view is at the bottom
        y = self.view.bounds.height - withHeight
    } else {
        // If withHeight is nil, use the full height (or adjust as needed)
        y = 0 // This would make the view cover the entire screen
    }
    rootView.frame = CGRect(
      x: self.view.bounds.minX,
      y: y,
      width: self.view.bounds.width,
      height: withHeight ?? self.view.bounds.height
    )
    rootView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    self.view.addSubview(rootView)
  }
  
  private func jsCodeLocation() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index.share")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
  
  private func backgroundColor(from dict: [String: CGFloat]?) -> UIColor {
    guard let dict = dict else { return .white }
    let red = dict["red"] ?? 255.0
    let green = dict["green"] ?? 255.0
    let blue = dict["blue"] ?? 255.0
    let alpha = dict["alpha"] ?? 1
    return UIColor(red: red / 255.0, green: green / 255.0, blue: blue / 255.0, alpha: alpha)
  }
  
  private func getShareData(completion: @escaping ([String: Any]?) -> Void) {
    guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
      completion(nil)
      return
    }
    
    var sharedItems: [String: Any] = [:]
    
    let group = DispatchGroup()
    
    for item in extensionItems {
      for provider in item.attachments ?? [] {
        if provider.hasItemConformingToTypeIdentifier(kUTTypeURL as String) {
          group.enter()
          provider.loadItem(forTypeIdentifier: kUTTypeURL as String, options: nil) { (urlItem, error) in
            DispatchQueue.main.async {
              if let sharedURL = urlItem as? URL {
                sharedItems["url"] = sharedURL.absoluteString
              }
              group.leave()
            }
          }
        }
      }
    }
    
    group.notify(queue: .main) {
      completion(sharedItems.isEmpty ? nil : sharedItems)
    }
  }
}
