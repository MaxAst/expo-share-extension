import UIKit
import React

class ShareExtensionViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        #if DEBUG
            let jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
        #else
            let jsCodeLocation = Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif

        if let validJsCodeLocation = jsCodeLocation {
            let rootView = RCTRootView(
                bundleURL: validJsCodeLocation,
                moduleName: "extension",
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