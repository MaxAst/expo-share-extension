import ExpoModulesCore

public class ExpoShareExtensionModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoShareExtension")

    Function("close") { () in
      NotificationCenter.default.post(name: NSNotification.Name("close"), object: nil)
    }

    Function("openHostApp") { (path: String) in
      let userInfo: [String: String] = ["path": path]
      NotificationCenter.default.post(name: NSNotification.Name("openHostApp"), object: nil, userInfo: userInfo)
    }
  }
}
