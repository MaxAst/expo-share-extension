import plist from "@expo/plist";
import { ConfigPlugin, InfoPlist, withInfoPlist } from "expo/config-plugins";
import fs from "fs";
import path from "path";

import {
  type BackgroundColor,
  type Height,
  getShareExtensionName,
} from "./index";

export const withShareExtensionInfoPlist: ConfigPlugin<{
  backgroundColor?: BackgroundColor;
  height?: Height;
}> = (config, { backgroundColor, height }) => {
  return withInfoPlist(config, (config) => {
    const targetName = getShareExtensionName(config);

    const targetPath = path.join(
      config.modRequest.platformProjectRoot,
      targetName
    );

    const filePath = path.join(targetPath, "Info.plist");

    let infoPlist: InfoPlist = {
      CFBundleDevelopmentRegion: "$(DEVELOPMENT_LANGUAGE)",
      CFBundleDisplayName: "$(PRODUCT_NAME) Share Extension",
      CFBundleExecutable: "$(EXECUTABLE_NAME)",
      CFBundleIdentifier: "$(PRODUCT_BUNDLE_IDENTIFIER)",
      CFBundleInfoDictionaryVersion: "6.0",
      CFBundleName: "$(PRODUCT_NAME)",
      CFBundlePackageType: "$(PRODUCT_BUNDLE_PACKAGE_TYPE)",
      CFBundleShortVersionString: "$(MARKETING_VERSION)",
      CFBundleVersion: "$(CURRENT_PROJECT_VERSION)",
      LSRequiresIPhoneOS: true,
      NSAppTransportSecurity: {
        NSExceptionDomains: {
          localhost: {
            NSExceptionAllowsInsecureHTTPLoads: true,
          },
        },
      },
      UIRequiredDeviceCapabilities: ["armv7"],
      UIStatusBarStyle: "UIStatusBarStyleDefault",
      UISupportedInterfaceOrientations: [
        "UIInterfaceOrientationPortrait",
        "UIInterfaceOrientationPortraitUpsideDown",
      ],
      UIUserInterfaceStyle: "Light",
      UIViewControllerBasedStatusBarAppearance: false,
      UIApplicationSceneManifest: {
        UIApplicationSupportsMultipleScenes: true,
        UISceneConfigurations: {},
      },
      NSExtension: {
        NSExtensionAttributes: {
          NSExtensionActivationRule: {
            NSExtensionActivationSupportsWebURLWithMaxCount: 1,
            NSExtensionActivationSupportsWebPageWithMaxCount: 1,
          },
        },
        NSExtensionPrincipalClass:
          "$(PRODUCT_MODULE_NAME).ShareExtensionViewController",
        NSExtensionPointIdentifier: "com.apple.share-services",
      },
      ShareExtensionBackgroundColor: backgroundColor,
      ShareExtensionHeight: height,
    };

    // see https://github.com/expo/expo/blob/main/packages/expo-apple-authentication/plugin/src/withAppleAuthIOS.ts#L3-L17
    if (config.ios?.usesAppleSignIn) {
      infoPlist = {
        ...infoPlist,
        CFBundleAllowedMixedLocalizations:
          config.modResults.CFBundleAllowMixedLocalizations ?? true,
      };
    }

    fs.mkdirSync(path.dirname(filePath), {
      recursive: true,
    });
    fs.writeFileSync(filePath, plist.build(infoPlist));

    return config;
  });
};
