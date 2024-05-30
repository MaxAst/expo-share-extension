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
  private weak var rootView: RCTRootView?
  private let loadingIndicator = UIActivityIndicatorView(style: .large)
  
  override func viewDidLoad() {
    super.viewDidLoad()
    setupLoadingIndicator()
#if canImport(FirebaseCore)
    if let withFirebase = Bundle.main.object(forInfoDictionaryKey: "WithFirebase") {
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
  
  private func openHostApp(path: String) {
    guard let scheme = Bundle.main.object(forInfoDictionaryKey: "HostAppScheme") as? String else { return }
    var urlComponents = URLComponents()
    urlComponents.scheme = scheme
    urlComponents.host = ""
    urlComponents.path = path
    guard let url = urlComponents.url else { return }
    let selectorOpenURL = sel_registerName("openURL:")
    var responder: UIResponder? = self
    while responder != nil {
      if responder?.responds(to: selectorOpenURL) == true {
        responder?.perform(selectorOpenURL, with: url)
        break // Exit the loop once the URL is opened
      }
      responder = responder!.next
    }
    self.close()
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
              
              if let imageUri = imageItem as? NSURL {
                if var imageArray = sharedItems["images"] as? [String] {
                  imageArray.append(imageUri.absoluteString ?? "")
                  sharedItems["images"] = imageArray
                }
              } else if let image = imageItem as? UIImage {
                // Handle UIImage if needed (e.g., save to disk and get the file path)
                if let imageData = image.jpegData(compressionQuality: 1.0) {
                  let tempDirectory = NSTemporaryDirectory()
                  let tempFile = URL(fileURLWithPath: tempDirectory).appendingPathComponent(UUID().uuidString).appendingPathExtension("jpg")
                  try? imageData.write(to: tempFile)
                  sharedItems["images"] = tempFile.absoluteString
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
              
              // Check if videoItem is NSURL
              if let videoUri = videoItem as? NSURL {
                if var videoArray = sharedItems["videos"] as? [String] {
                  videoArray.append(videoUri.absoluteString ?? "")
                  sharedItems["videos"] = videoArray
                }
              }
              // Check if videoItem is NSData
              else if let videoData = videoItem as? NSData {
                let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
                let fileName = UUID().uuidString + ".mov"
                let fileURL = documentsDirectory.appendingPathComponent(fileName)
                do {
                  try videoData.write(to: fileURL)
                  if var videoArray = sharedItems["videos"] as? [String] {
                    videoArray.append(fileURL.absoluteString)
                    sharedItems["videos"] = videoArray
                  }
                } catch {
                  print("Failed to save video: \(error)")
                }
              }
              // Check if videoItem is AVAsset
              else if let asset = videoItem as? AVAsset {
                let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetPassthrough)
                let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
                let fileName = UUID().uuidString + ".mov"
                let fileURL = documentsDirectory.appendingPathComponent(fileName)
                exportSession?.outputURL = fileURL
                exportSession?.outputFileType = .mov
                exportSession?.exportAsynchronously {
                  switch exportSession?.status {
                  case .completed:
                    if var videoArray = sharedItems["videos"] as? [String] {
                      videoArray.append(fileURL.absoluteString)
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
