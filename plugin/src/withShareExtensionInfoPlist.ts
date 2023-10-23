import plist from "@expo/plist";
import { ConfigPlugin, InfoPlist, withInfoPlist } from "expo/config-plugins";
import fs from "fs";
import path from "path";

import {
  getShareExtensionInfoPlistFileName,
  getShareExtensionName,
} from "./index";

export const withShareExtensionInfoPlist: ConfigPlugin = (config) => {
  return withInfoPlist(config, (config) => {
    const targetName = getShareExtensionName(config);

    const targetPath = path.join(
      config.modRequest.platformProjectRoot,
      targetName
    );

    const filePath = path.join(
      config.modRequest.platformProjectRoot,
      targetName,
      getShareExtensionInfoPlistFileName(config)
    );

    const infoPlist: InfoPlist = {
      CFBundleName: "$(PRODUCT_NAME)",
      CFBundleDisplayName: "$(PRODUCT_NAME) Share Extension",
      CFBundleIdentifier: "$(PRODUCT_BUNDLE_IDENTIFIER)",
      CFBundleDevelopmentRegion: "$(DEVELOPMENT_LANGUAGE)",
      CFBundleExecutable: "$(EXECUTABLE_NAME)",
      CFBundleInfoDictionaryVersion: "6.0",
      CFBundlePackageType: "$(PRODUCT_BUNDLE_PACKAGE_TYPE)",
      CFBundleVersion: "$(CURRENT_PROJECT_VERSION)",
      CFBundleShortVersionString: config.version,
      UIViewControllerBasedStatusBarAppearance: "NO",
      UILaunchStoryboardName: "SplashScreen",
      UIRequiresFullScreen: true,
      NSExtension: {
        NSExtensionAttributes: {
          NSExtensionActivationRule: {
            NSExtensionActivationSupportsWebURLWithMaxCount: 1,
            NSExtensionActivationSupportsWebPageWithMaxCount: 1,
          },
        },
        NSExtensionMainStoryboard: "MainInterface",
        NSExtensionPointIdentifier: "com.apple.share-services",
      },
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: config.developmentClient,
        NSExceptionDomains: {
          localhost: {
            NSExceptionAllowsInsecureHTTPLoads: config.developmentClient,
          },
        },
        NSAllowsLocalNetworking: config.developmentClient,
      },
    };

    config.ios?.infoPlist &&
      Object.keys(config.ios?.infoPlist).forEach((key: string) => {
        config.ios?.infoPlist && (infoPlist[key] = config.ios.infoPlist[key]);
      });

    fs.mkdirSync(path.dirname(filePath), {
      recursive: true,
    });
    fs.writeFileSync(filePath, plist.build(infoPlist));

    // Expo.plist
    const expoPlistFilePath = path.join(targetPath, "Supporting/Expo.plist");
    const expoPlist: InfoPlist = {
      EXUpdatesRuntimeVersion: "exposdk:49.0.0",
      EXUpdatesEnabled: false,
    };

    fs.mkdirSync(path.dirname(expoPlistFilePath), {
      recursive: true,
    });
    fs.writeFileSync(expoPlistFilePath, plist.build(expoPlist));

    return config;
  });
};
