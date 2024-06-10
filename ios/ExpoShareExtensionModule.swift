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

    AsyncFunction("clearAppGroupContainer") { (date: String?, promise: Promise) in
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

        var comparisonDate: Date? = nil
        if let isoDateString = date {
          let isoFormatter = ISO8601DateFormatter()
          // new Date().toISOString() returns fractional seconds, which we need to account for:
          isoFormatter.formatOptions.insert(.withFractionalSeconds)
          if let date = isoFormatter.date(from: isoDateString) {
            comparisonDate = date
          } else {
            DispatchQueue.main.async {
              promise.reject("ERR_INVALID_DATE", "The provided date string is not in a valid ISO 8601 format")
            }
            return
          }
        }

        let fileManager = FileManager.default
        let sharedDataUrl = containerUrl.deletingLastPathComponent().appendingPathComponent("sharedData")

        if fileManager.fileExists(atPath: sharedDataUrl.path) {
          do {
            let contents = try fileManager.contentsOfDirectory(atPath: sharedDataUrl.path)
            for item in contents {
              let itemPath = sharedDataUrl.appendingPathComponent(item).path
              if let creationDate = self.getCreationDate(of: itemPath) {
                if let comparisonDate = comparisonDate {
                  if creationDate < comparisonDate {
                    try fileManager.removeItem(atPath: itemPath)
                  }
                } else {
                  try fileManager.removeItem(atPath: itemPath)
                }
              } else {
                DispatchQueue.main.async {
                  promise.reject("ERR_REMOVE_CONTENTS", "Unable to retrieve creation date")
                }
                return
              }
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

  internal func getCreationDate(of filePath: String) -> Date? {
    let fileManager = FileManager.default
    do {
      let attributes = try fileManager.attributesOfItem(atPath: filePath)
      if let creationDate = attributes[.creationDate] as? Date {
        return creationDate
      }
    } catch {
      print("Error getting file attributes: \(error.localizedDescription)")
    }
    return nil
  }
}
