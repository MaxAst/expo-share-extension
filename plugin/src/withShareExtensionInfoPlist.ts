import plist from "@expo/plist";
import { ConfigPlugin, InfoPlist, withInfoPlist } from "expo/config-plugins";
import fs from "fs";
import path from "path";

import { getShareExtensionName } from "./index";

export const withShareExtensionInfoPlist: ConfigPlugin = (config) => {
  return withInfoPlist(config, (config) => {
    const targetName = getShareExtensionName(config);

    const targetPath = path.join(
      config.modRequest.platformProjectRoot,
      targetName
    );

    const filePath = path.join(targetPath, "Info.plist");

    const infoPlist: InfoPlist = {
      CFBundleName: "$(PRODUCT_NAME)",
      CFBundleDisplayName: "$(PRODUCT_NAME) Share Extension",
      CFBundleIdentifier: "$(PRODUCT_BUNDLE_IDENTIFIER)",
      CFBundleDevelopmentRegion: "$(DEVELOPMENT_LANGUAGE)",
      CFBundleExecutable: "$(EXECUTABLE_NAME)",
      CFBundleInfoDictionaryVersion: "6.0",
      CFBundlePackageType: "$(PRODUCT_BUNDLE_PACKAGE_TYPE)",
      UILaunchStoryboardName: "SplashScreen",
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

    fs.mkdirSync(path.dirname(filePath), {
      recursive: true,
    });
    fs.writeFileSync(filePath, plist.build(infoPlist));

    return config;
  });
};
