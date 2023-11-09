import UIKit
import React

class ShareExtensionViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        self.view.backgroundColor = .red

        // Setup the React Native view
        let jsCodeLocation: URL?

        #if DEBUG
            jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry", fallbackResource: nil)
        #else
            jsCodeLocation = Bundle.main.url(forResource: "main", withExtension: "jsbundle")
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