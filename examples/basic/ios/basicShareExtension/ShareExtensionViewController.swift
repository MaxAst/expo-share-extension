import UIKit
import React
import React_RCTAppDelegate
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

// MARK: - Objective-C Bridge
@objc class RCTShareExtensionBridge: NSObject {
  @objc static func createRootViewFactory() -> RCTRootViewFactory {
    let configuration = RCTRootViewFactoryConfiguration(
      bundleURLBlock: {
#if DEBUG
        let settings = RCTBundleURLProvider.sharedSettings()
        settings.enableDev = true
        settings.enableMinification = false
        if let bundleURL = settings.jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry") {
          if var components = URLComponents(url: bundleURL, resolvingAgainstBaseURL: false) {
            components.queryItems = (components.queryItems ?? []) + [URLQueryItem(name: "shareExtension", value: "true")]
            return components.url ?? bundleURL
          }
          return bundleURL
        }
        fatalError("Could not create bundle URL")
#else
        guard let bundleURL = Bundle.main.url(forResource: "main", withExtension: "jsbundle") else {
          fatalError("Could not load bundle URL")
        }
        return bundleURL
#endif
      },
      newArchEnabled: false,
      turboModuleEnabled: true,
      bridgelessEnabled: false
    )
    
    return RCTRootViewFactory(configuration: configuration)
  }
}

class ShareExtensionViewController: UIViewController {
  private var rootViewFactory: RCTRootViewFactory?
  private weak var rootView: UIView?
  private let loadingIndicator = UIActivityIndicatorView(style: .large)
  
  deinit {
    print("🧹 ShareExtensionViewController deinit")
    cleanupAfterClose()
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    // Start cleanup earlier to ensure proper surface teardown
    if isBeingDismissed {
      cleanupAfterClose()
    }
  }
  
  override func viewDidLoad() {
    super.viewDidLoad()
    setupLoadingIndicator()
    
#if canImport(FirebaseCore)
    if Bundle.main.object(forInfoDictionaryKey: "WithFirebase") as? Bool ?? false {
      FirebaseApp.configure()
    }
#endif
    
    initializeRootViewFactory()
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
  
  private func initializeRootViewFactory() {
    if rootViewFactory == nil {
      rootViewFactory = RCTShareExtensionBridge.createRootViewFactory()
    }
  }
  
  private func openHostApp(path: String?) {
    guard let scheme = Bundle.main.object(forInfoDictionaryKey: "HostAppScheme") as? String else { return }
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
    
    guard let url = urlComponents.url else { return }
    openURL(url)
    self.close()
  }
  
  @objc @discardableResult private func openURL(_ url: URL) -> Bool {
    var responder: UIResponder? = self
    while responder != nil {
      if let application = responder as? UIApplication {
        if #available(iOS 18.0, *) {
          application.open(url, options: [:], completionHandler: nil)
          return true
        } else {
          return application.perform(#selector(UIApplication.open(_:options:completionHandler:)), with: url, with: [:]) != nil
        }
      }
      responder = responder?.next
    }
    return false
  }
  
  private func loadReactNativeContent() {
    getShareData { [weak self] sharedData in      
      guard let self = self else {
        print("❌ Self was deallocated")
        return
      }
      
      DispatchQueue.main.async {
        if self.rootView == nil {
          guard let factory = self.rootViewFactory else {
            print("🚨 Factory is nil")
            return
          }
          
          let rootView = factory.view(
            withModuleName: "shareExtension",
            initialProperties: sharedData
          )                 
          let backgroundFromInfoPlist = Bundle.main.object(forInfoDictionaryKey: "ShareExtensionBackgroundColor") as? [String: CGFloat]
          let heightFromInfoPlist = Bundle.main.object(forInfoDictionaryKey: "ShareExtensionHeight") as? CGFloat
          
          self.configureRootView(rootView, withBackgroundColorDict: backgroundFromInfoPlist, withHeight: heightFromInfoPlist)
          self.rootView = rootView
        } else {
          // Update properties based on view type
          if let rctView = self.rootView as? RCTRootView {
            rctView.appProperties = sharedData
          } else if let proxyView = self.rootView as? RCTSurfaceHostingProxyRootView {
            proxyView.appProperties = sharedData ?? [:]
          }
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
    
    NotificationCenter.default.addObserver(forName: NSNotification.Name("openHostApp"), object: nil, queue: nil) { [weak self] notification in
      DispatchQueue.main.async {
        if let userInfo = notification.userInfo {
          if let path = userInfo["path"] as? String {
            self?.openHostApp(path: path)
          }
        }
      }
    }
  }
  
  private func cleanupAfterClose() {
    // Clean up notification observers first
    NotificationCenter.default.removeObserver(self)
    
    // Clean up properties based on view type
    if let rctView = rootView as? RCTRootView {
      rctView.appProperties = nil
    } else if let proxyView = rootView as? RCTSurfaceHostingProxyRootView {
      proxyView.appProperties = [:]
    }
    
    rootView?.removeFromSuperview()
    rootView = nil
    
    // Clean up factory last
    rootViewFactory = nil
  }
  
  private func configureRootView(_ rootView: UIView, withBackgroundColorDict dict: [String: CGFloat]?, withHeight: CGFloat?) {
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
    } else {
      frame = screenBounds
    }
    
    if let proxyRootView = rootView as? RCTSurfaceHostingProxyRootView {
      // Set surface size in points (not pixels)
      let surfaceSize = CGSize(
        width: frame.width * screenScale,
        height: frame.height * screenScale
      )
      
      proxyRootView.surface.setMinimumSize(surfaceSize, maximumSize: surfaceSize)
      
      // Set bounds in points
      proxyRootView.bounds = CGRect(origin: .zero, size: frame.size)
      proxyRootView.center = CGPoint(x: frame.midX, y: frame.midY)
    } else {
      rootView.frame = frame
    }
    
    rootView.translatesAutoresizingMaskIntoConstraints = false
    self.view.addSubview(rootView)
    
    NSLayoutConstraint.activate([
      rootView.leadingAnchor.constraint(equalTo: self.view.leadingAnchor),
      rootView.trailingAnchor.constraint(equalTo: self.view.trailingAnchor),
      rootView.heightAnchor.constraint(equalToConstant: frame.height)
    ])
    
    if let withHeight = withHeight {
      NSLayoutConstraint.activate([
        rootView.bottomAnchor.constraint(equalTo: self.view.bottomAnchor)
      ])
    } else {
      NSLayoutConstraint.activate([
        rootView.topAnchor.constraint(equalTo: self.view.topAnchor)
      ])
    }
    
    if withHeight == nil {
      rootView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
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
  
  private func getShareData(completion: @escaping ([String: Any]?) -> Void) {
    guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
      completion(nil)
      return
    }
    
    var sharedItems: [String: Any] = [:]
    
    let group = DispatchGroup()
    
    let fileManager = FileManager.default
    
    for item in extensionItems {
      for provider in item.attachments ?? [] {
        if provider.hasItemConformingToTypeIdentifier(kUTTypeURL as String) {
          group.enter()
          provider.loadItem(forTypeIdentifier: kUTTypeURL as String, options: nil) { (urlItem, error) in
            DispatchQueue.main.async {
              if let sharedURL = urlItem as? URL {
                if sharedURL.isFileURL {
                  if sharedItems["files"] == nil {
                    sharedItems["files"] = [String]()
                  }
                  if var fileArray = sharedItems["files"] as? [String] {
                    fileArray.append(sharedURL.absoluteString)
                    sharedItems["files"] = fileArray
                  }
                } else {
                  sharedItems["url"] = sharedURL.absoluteString
                }
              }
              group.leave()
            }
          }
        } else if provider.hasItemConformingToTypeIdentifier(kUTTypePropertyList as String) {
          group.enter()
          provider.loadItem(forTypeIdentifier: kUTTypePropertyList as String, options: nil) { (item, error) in
            DispatchQueue.main.async {
              if let itemDict = item as? NSDictionary,
                 let results = itemDict[NSExtensionJavaScriptPreprocessingResultsKey] as? NSDictionary {
                sharedItems["preprocessingResults"] = results
              }
              group.leave()
            }
          }
        } else if provider.hasItemConformingToTypeIdentifier(kUTTypeText as String) {
          group.enter()
          provider.loadItem(forTypeIdentifier: kUTTypeText as String, options: nil) { (textItem, error) in
            DispatchQueue.main.async {
              if let text = textItem as? String {
                sharedItems["text"] = text
              }
              group.leave()
            }
          }
        } else if provider.hasItemConformingToTypeIdentifier(kUTTypeImage as String) {
          group.enter()
          provider.loadItem(forTypeIdentifier: kUTTypeImage as String, options: nil) { (imageItem, error) in
            DispatchQueue.main.async {
              
              // Ensure the array exists
              if sharedItems["images"] == nil {
                sharedItems["images"] = [String]()
              }
              
              guard let appGroup = Bundle.main.object(forInfoDictionaryKey: "AppGroup") as? String else {
                print("Could not find AppGroup in info.plist")
                return
              }
              
              guard let containerUrl = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroup) else {
                print("Could not set up file manager container URL for app group")
                return
              }
              
              if let imageUri = imageItem as? NSURL {
                if let tempFilePath = imageUri.path {
                  let fileExtension = imageUri.pathExtension ?? "jpg"
                  let fileName = UUID().uuidString + "." + fileExtension
                  
                  let sharedDataUrl = containerUrl.appendingPathComponent("sharedData")
                  
                  if !fileManager.fileExists(atPath: sharedDataUrl.path) {
                    do {
                      try fileManager.createDirectory(at: sharedDataUrl, withIntermediateDirectories: true)
                    } catch {
                      print("Failed to create sharedData directory: \(error)")
                    }
                  }
                  
                  let persistentURL = sharedDataUrl.appendingPathComponent(fileName)
                  
                  do {
                    try fileManager.copyItem(atPath: tempFilePath, toPath: persistentURL.path)
                    if var videoArray = sharedItems["images"] as? [String] {
                      videoArray.append(persistentURL.absoluteString)
                      sharedItems["images"] = videoArray
                    }
                  } catch {
                    print("Failed to copy image: \(error)")
                  }
                }
              } else if let image = imageItem as? UIImage {
                // Handle UIImage if needed (e.g., save to disk and get the file path)
                if let imageData = image.jpegData(compressionQuality: 1.0) {
                  let fileName = UUID().uuidString + ".jpg"
                  
                  let sharedDataUrl = containerUrl.appendingPathComponent("sharedData")
                  
                  if !fileManager.fileExists(atPath: sharedDataUrl.path) {
                    do {
                      try fileManager.createDirectory(at: sharedDataUrl, withIntermediateDirectories: true)
                    } catch {
                      print("Failed to create sharedData directory: \(error)")
                    }
                  }
                  
                  let persistentURL = sharedDataUrl.appendingPathComponent(fileName)
                  
                  do {
                    try imageData.write(to: persistentURL)
                    if var imageArray = sharedItems["images"] as? [String] {
                      imageArray.append(persistentURL.absoluteString)
                      sharedItems["images"] = imageArray
                    }
                  } catch {
                    print("Failed to save image: \(error)")
                  }
                }
              } else {
                print("imageItem is not a recognized type")
              }
              group.leave()
            }
          }
        } else if provider.hasItemConformingToTypeIdentifier(kUTTypeMovie as String) {
          group.enter()
          provider.loadItem(forTypeIdentifier: kUTTypeMovie as String, options: nil) { (videoItem, error) in
            DispatchQueue.main.async {
              print("videoItem type: \(type(of: videoItem))")
              
              // Ensure the array exists
              if sharedItems["videos"] == nil {
                sharedItems["videos"] = [String]()
              }
              
              guard let appGroup = Bundle.main.object(forInfoDictionaryKey: "AppGroup") as? String else {
                print("Could not find AppGroup in info.plist")
                return
              }
              
              guard let containerUrl = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroup) else {
                print("Could not set up file manager container URL for app group")
                return
              }
              
              // Check if videoItem is NSURL
              if let videoUri = videoItem as? NSURL {
                if let tempFilePath = videoUri.path {
                  let fileExtension = videoUri.pathExtension ?? "mov"
                  let fileName = UUID().uuidString + "." + fileExtension
                  
                  let sharedDataUrl = containerUrl.appendingPathComponent("sharedData")
                  
                  if !fileManager.fileExists(atPath: sharedDataUrl.path) {
                    do {
                      try fileManager.createDirectory(at: sharedDataUrl, withIntermediateDirectories: true)
                    } catch {
                      print("Failed to create sharedData directory: \(error)")
                    }
                  }
                  
                  let persistentURL = sharedDataUrl.appendingPathComponent(fileName)
                  
                  do {
                    try fileManager.copyItem(atPath: tempFilePath, toPath: persistentURL.path)
                    if var videoArray = sharedItems["videos"] as? [String] {
                      videoArray.append(persistentURL.path)
                      sharedItems["videos"] = videoArray
                    }
                  } catch {
                    print("Failed to copy video: \(error)")
                  }
                }
              }
              // Check if videoItem is NSData
              else if let videoData = videoItem as? NSData {
                let fileExtension = "mov" // Using mov as default type extension
                let fileName = UUID().uuidString + "." + fileExtension
                
                let sharedDataUrl = containerUrl.appendingPathComponent("sharedData")
                
                if !fileManager.fileExists(atPath: sharedDataUrl.path) {
                  do {
                    try fileManager.createDirectory(at: sharedDataUrl, withIntermediateDirectories: true)
                  } catch {
                    print("Failed to create sharedData directory: \(error)")
                  }
                }
                
                let persistentURL = sharedDataUrl.appendingPathComponent(fileName)
                
                do {
                  try videoData.write(to: persistentURL)
                  if var videoArray = sharedItems["videos"] as? [String] {
                    videoArray.append(persistentURL.path)
                    sharedItems["videos"] = videoArray
                  }
                } catch {
                  print("Failed to save video: \(error)")
                }
              }
              // Check if videoItem is AVAsset
              else if let asset = videoItem as? AVAsset {
                let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetPassthrough)
                
                let fileExtension = "mov" // Using mov as default type extension
                let fileName = UUID().uuidString + "." + fileExtension
                
                let sharedDataUrl = containerUrl.appendingPathComponent("sharedData")
                
                if !fileManager.fileExists(atPath: sharedDataUrl.path) {
                  do {
                    try fileManager.createDirectory(at: sharedDataUrl, withIntermediateDirectories: true)
                  } catch {
                    print("Failed to create sharedData directory: \(error)")
                  }
                }
                
                let persistentURL = sharedDataUrl.appendingPathComponent(fileName)
                
                exportSession?.outputURL = persistentURL
                exportSession?.outputFileType = .mov
                exportSession?.exportAsynchronously {
                  switch exportSession?.status {
                  case .completed:
                    if var videoArray = sharedItems["videos"] as? [String] {
                      videoArray.append(persistentURL.absoluteString)
                      sharedItems["videos"] = videoArray
                    }
                  case .failed:
                    print("Failed to export video: \(String(describing: exportSession?.error))")
                  default:
                    break
                  }
                }
              } else {
                print("videoItem is not a recognized type")
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