import plist from "@expo/plist";
import { ConfigPlugin, InfoPlist, withInfoPlist } from "expo/config-plugins";
import fs from "fs";
import path from "path";

import {
  type BackgroundColor,
  type Height,
  getShareExtensionName,
} from "./index";

const getReversedClientId = (googleServiceFile: string): string => {
  try {
    const googleServicePlist = fs.readFileSync(googleServiceFile, "utf8");

    const googleServiceJson = plist.parse(googleServicePlist);
    const REVERSED_CLIENT_ID = googleServiceJson.REVERSED_CLIENT_ID;

    if (!REVERSED_CLIENT_ID) {
      throw new TypeError("REVERSED_CLIENT_ID missing");
    }

    return REVERSED_CLIENT_ID;
  } catch {
    throw new Error(
      "[expo-share-extension] Failed to parse your share extension's GoogleService-Info.plist. Are you sure it is a valid Info.Plist file with a REVERSE_CLIENT_ID field?",
    );
  }
};

export const withShareExtensionInfoPlist: ConfigPlugin<{
  fonts: string[];
  backgroundColor?: BackgroundColor;
  height?: Height;
  preprocessingFile?: string;
  googleServicesFile?: string;
}> = (
  config,
  {
    fonts = [],
    backgroundColor,
    height,
    preprocessingFile,
    googleServicesFile,
  },
) => {
  return withInfoPlist(config, (config) => {
    const targetName = getShareExtensionName(config);

    let reversedClientId: string | undefined;

    if (googleServicesFile) {
      reversedClientId = getReversedClientId(googleServicesFile);
    }

    const targetPath = path.join(
      config.modRequest.platformProjectRoot,
      targetName,
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
      ...(reversedClientId && {
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [reversedClientId],
          },
        ],
      }),
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
      UIAppFonts: fonts.map((font) => path.basename(font)) ?? [],
      NSExtension: {
        NSExtensionAttributes: {
          NSExtensionActivationRule: {
            NSExtensionActivationSupportsWebURLWithMaxCount: 1,
            NSExtensionActivationSupportsText: true,
            ...(preprocessingFile && {
              NSExtensionActivationSupportsWebPageWithMaxCount: 1,
            }),
          },
          ...(preprocessingFile && {
            NSExtensionJavaScriptPreprocessingFile: path.basename(
              preprocessingFile,
              path.extname(preprocessingFile),
            ),
          }),
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
