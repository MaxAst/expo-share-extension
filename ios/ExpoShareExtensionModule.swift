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

    AsyncFunction("clearAppGroupContainer") { (promise: Promise) in
      DispatchQueue.global(qos: .background).async {
        guard let appGroup = Bundle.main.object(forInfoDictionaryKey: "AppGroup") as? String else {
          DispatchQueue.main.async {
            promise.reject("ERR_APP_GROUP", "Could not find AppGroup in info.plist")
          }
          return
        }

        guard let containerUrl = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroup) else {
          DispatchQueue.main.async {
            promise.reject("ERR_CONTAINER_URL", "Could not set up file manager container URL for app group")
          }
          return
        }

        let fileManager = FileManager.default
        let sharedDataUrl = containerUrl.deletingLastPathComponent().appendingPathComponent("sharedData")

        if fileManager.fileExists(atPath: sharedDataUrl.path) {
          do {
            let contents = try fileManager.contentsOfDirectory(atPath: sharedDataUrl.path)
            for item in contents {
              let itemPath = sharedDataUrl.appendingPathComponent(item).path
              try fileManager.removeItem(atPath: itemPath)
            }
            DispatchQueue.main.async {
              print("sharedData directory contents removed successfully.")
              promise.resolve()
            }
          } catch {
            DispatchQueue.main.async {
              promise.reject("ERR_REMOVE_CONTENTS", "Error removing sharedData directory contents: \(error)")
            }
          }
        } else {
          DispatchQueue.main.async {
            print("sharedData directory does not exist.")
            promise.resolve()
          }
        }
      }
    }
  }
}
