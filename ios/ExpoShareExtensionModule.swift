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

    Function("clearMedia") { () in
      guard let appGroup = Bundle.main.object(forInfoDictionaryKey: "AppGroup") as? String else {
        print("Could not find AppGroup in info.plist")
        return
      }
              
      guard let containerUrl = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroup) else {
        print("Could not set up file manager container URL for app group")
        return
      }

      let fileManager = FileManager.default
      let mediaUrl = containerUrl.appendingPathComponent("media")

      do {
        try fileManager.removeItem(at: mediaUrl)
      } catch {
        print("Error removing media folder: \(error)")
      }
    }
  }
}
