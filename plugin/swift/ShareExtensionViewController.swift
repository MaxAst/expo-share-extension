import UIKit
import React
import MobileCoreServices

class ShareExtensionViewController: UIViewController {
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
#if DEBUG
    let jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index.share")
#else
    let jsCodeLocation = Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
    
    getShareData { [weak self] sharedData in
      
      guard let strongSelf = self else {
          return
      }
      
      if let validJsCodeLocation = jsCodeLocation {
        let rootView = RCTRootView(
          bundleURL: validJsCodeLocation,
          moduleName: "extension",
          initialProperties: sharedData,
          launchOptions: nil
        )
        
        if let backgroundColorDict = Bundle.main.object(forInfoDictionaryKey: "ShareExtensionBackgroundColor") as? [String: CGFloat] {
          let red = backgroundColorDict["red"] ?? 255.0
          let green = backgroundColorDict["green"] ?? 255.0
          let blue = backgroundColorDict["blue"] ?? 255.0
          let alpha = backgroundColorDict["alpha"] ?? 1
          
          rootView.backgroundColor = UIColor(red: red / 255.0, green: green / 255.0, blue: blue / 255.0, alpha: alpha)
        }
        
        strongSelf.view = rootView
        
        DispatchQueue.main.async {
          strongSelf.view = rootView
        }
      } else {
        let testView = UIView(frame: strongSelf.view.bounds)
        testView.backgroundColor = .green
        strongSelf.view = testView
      }
    }
  }
  
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    self.preferredContentSize = CGSize(width: self.view.frame.width, height: 300) // Or any other height you want
  }
  
  private func getShareData(completion: @escaping ([String: Any]?) -> Void) {
    guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
      completion(nil)
      return
    }

    var sharedItems: [String: Any] = [:]
    
    for item in extensionItems {
      for provider in item.attachments ?? [] {
        if provider.hasItemConformingToTypeIdentifier(kUTTypeURL as String) {
          provider.loadItem(forTypeIdentifier: kUTTypeURL as String, options: nil) { (urlItem, error) in
            // Ensure execution on the main thread since UI updates and completion handlers are involved
            DispatchQueue.main.async {
              if let sharedURL = urlItem as? URL {
                sharedItems["url"] = sharedURL.absoluteString
                completion(sharedItems) // Call completion with sharedItems
              } else {
                completion(nil)  // Call completion with nil if URL is not found
              }
            }
          }
          break // Exit the loop once the URL is found
        }
      }
    }
    
    if sharedItems.isEmpty {
      completion(nil)
    }
  }
}
