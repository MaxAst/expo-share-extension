import UIKit
import React
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

class ShareExtensionViewController: UIViewController {
  
  private static var sharedBridge: RCTBridge?
  private weak var rootView: RCTSurfaceHostingView?
  private let loadingIndicator = UIActivityIndicatorView(style: .large)
  
  override func viewDidLoad() {
    super.viewDidLoad()
    setupLoadingIndicator()
#if canImport(FirebaseCore)
    if Bundle.main.object(forInfoDictionaryKey: "WithFirebase") as? Bool ?? false {
      FirebaseApp.configure()
    }
#endif
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
      
      // Initialize the bridge with the new architecture enabled
      let bridgeDelegate = RCTSurfacePresenterBridgeDelegate()
      let bridge = RCTBridge(delegate: bridgeDelegate, launchOptions: nil)
      ShareExtensionViewController.sharedBridge = bridge
      
      // Initialize the Surface Presenter
      let surfacePresenter = RCTSurfacePresenter(bridge: bridge, bridgeDelegate: bridgeDelegate)
      bridgeDelegate.surfacePresenter = surfacePresenter
    }
  }
  
  private func loadReactNativeContent() {
    getShareData { [weak self] sharedData in
      guard let self = self,
            let bridge = ShareExtensionViewController.sharedBridge else { return }
      
      DispatchQueue.main.async {
        if self.rootView == nil {
          // Create a Surface for the React Native content
          let surface = RCTSurface(bridge: bridge, moduleName: "shareExtension", initialProperties: sharedData ?? [:])
          surface.start()
          
          // Create a Surface Hosting View
          let rootView = RCTSurfaceHostingView(surface: surface)
          
          let backgroundFromInfoPlist = Bundle.main.object(forInfoDictionaryKey: "ShareExtensionBackgroundColor") as? [String: CGFloat]
          let heightFromInfoPlist = Bundle.main.object(forInfoDictionaryKey: "ShareExtensionHeight") as? CGFloat
          
          self.configureRootView(rootView, withBackgroundColorDict: backgroundFromInfoPlist, withHeight: heightFromInfoPlist)
          self.rootView = rootView
        } else {
          // Update existing surface with new data
          if let surface = self.rootView?.surface {
            surface.setProps(sharedData ?? [:])
          }
        }
        
        self.loadingIndicator.stopAnimating()
        self.loadingIndicator.removeFromSuperview()
      }
    }
  }
  
  private func configureRootView(_ rootView: RCTSurfaceHostingView, withBackgroundColorDict dict: [String: CGFloat]?, withHeight: CGFloat?) {
    rootView.backgroundColor = backgroundColor(from: dict)
    
    let y: CGFloat
    if let withHeight = withHeight {
      y = self.view.bounds.height - withHeight
    } else {
      y = 0
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
  
  private func setupNotificationCenterObserver() {
    NotificationCenter.default.addObserver(
      forName: NSNotification.Name("close"),
      object: nil,
      queue: nil
    ) { [weak self] _ in
      DispatchQueue.main.async {
        self?.close()
      }
    }
    
    NotificationCenter.default.addObserver(
      forName: NSNotification.Name("openHostApp"),
      object: nil,
      queue: nil
    ) { [weak self] notification in
      DispatchQueue.main.async {
        if let userInfo = notification.userInfo,
           let path = userInfo["path"] as? String {
          self?.openHostApp(path: path)
        }
      }
    }
  }
  
  private func cleanupAfterClose() {
    rootView?.removeFromSuperview()
    rootView = nil
    
    // Properly cleanup the Surface
    if let surface = rootView?.surface {
      surface.stop()
    }
    
    ShareExtensionViewController.sharedBridge?.invalidate()
    ShareExtensionViewController.sharedBridge = nil
    NotificationCenter.default.removeObserver(self)
  }
  
  private func jsCodeLocation() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index.share")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
  
  // Rest of the helper methods remain the same (backgroundColor, getShareData, openHostApp, openURL)
  // ... [Previous implementation of these methods]
}