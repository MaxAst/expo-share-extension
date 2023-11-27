import UIKit
import React

class ShareExtensionViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        #if DEBUG
            // Setup the React Native view for Debug mode
            let jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
            // let jsCodeLocation = URL(string: "http://127.0.0.1:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false")
        #else
            // Setup the React Native view for Release mode
            let jsCodeLocation = Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif

        if let validJsCodeLocation = jsCodeLocation {
            let rootView = RCTRootView(
                bundleURL: validJsCodeLocation,
                moduleName: "main",
                initialProperties: nil,
                launchOptions: nil
            )
            rootView.backgroundColor = UIColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 1)
            self.view = rootView
        } else {
            let testView = UIView(frame: self.view.bounds)
            testView.backgroundColor = .green
            self.view = testView
        }
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.preferredContentSize = CGSize(width: self.view.frame.width, height: 300) // Or any other height you want
    }
}