import plist from "@expo/plist";
import {
  type ConfigPlugin,
  type InfoPlist,
  withInfoPlist,
} from "expo/config-plugins";
import fs from "fs";
import path from "path";

import {
  type ActivationRule,
  type BackgroundColor,
  type Height,
  getAppGroup,
  getShareExtensionName,
} from "./index";

export const withShareExtensionInfoPlist: ConfigPlugin<{
  fonts: string[];
  activationRules?: ActivationRule[];
  backgroundColor?: BackgroundColor;
  height?: Height;
  preprocessingFile?: string;
  googleServicesFile?: string;
}> = (
  config,
  {
    fonts = [],
    activationRules = [{ type: "text" }, { type: "url" }],
    backgroundColor,
    height,
    preprocessingFile,
    googleServicesFile,
  }
) => {
  return withInfoPlist(config, (config) => {
    const targetName = getShareExtensionName(config);

    const targetPath = path.join(
      config.modRequest.platformProjectRoot,
      targetName
    );

    const filePath = path.join(targetPath, "Info.plist");

    const appGroup = getAppGroup(config);

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
      UIDesignRequiresCompatibility: true,
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
      UIUserInterfaceStyle: "Automatic",
      UIViewControllerBasedStatusBarAppearance: false,
      UIApplicationSceneManifest: {
        UIApplicationSupportsMultipleScenes: true,
        UISceneConfigurations: {},
      },
      UIAppFonts: fonts.map((font) => path.basename(font)) ?? [],
      AppGroup: appGroup,
      AppGroupIdentifier: appGroup,
      NSExtension: {
        NSExtensionAttributes: {
          NSExtensionActivationRule: (() => {
            // Screenshot overlay sends public.url instead of public.image, so add file support when image is requested
            const hasImage = activationRules.some(
              (rule) => rule.type === "image"
            );
            const hasFile = activationRules.some(
              (rule) => rule.type === "file"
            );
            const rulesToProcess =
              hasImage && !hasFile
                ? [
                    ...activationRules,
                    {
                      type: "file" as const,
                      max:
                        activationRules.find((rule) => rule.type === "image")
                          ?.max ?? 1,
                    },
                  ]
                : activationRules;

            return rulesToProcess.reduce((acc, current) => {
              switch (current.type) {
                case "image":
                  return {
                    ...acc,
                    NSExtensionActivationSupportsImageWithMaxCount:
                      current.max ?? 1,
                  };
                case "video":
                  return {
                    ...acc,
                    NSExtensionActivationSupportsMovieWithMaxCount:
                      current.max ?? 1,
                  };
                case "text":
                  return {
                    ...acc,
                    NSExtensionActivationSupportsText: true,
                  };
                case "url":
                  return preprocessingFile
                    ? {
                        ...acc,
                        NSExtensionActivationSupportsWebPageWithMaxCount:
                          current.max ?? 1,
                        NSExtensionActivationSupportsWebURLWithMaxCount:
                          current.max ?? 1,
                      }
                    : {
                        ...acc,
                        NSExtensionActivationSupportsWebURLWithMaxCount:
                          current.max ?? 1,
                      };
                case "file":
                  return {
                    ...acc,
                    NSExtensionActivationSupportsFileWithMaxCount:
                      current.max ?? 1,
                  };
                default:
                  return acc;
              }
            }, {});
          })(),
          ...(preprocessingFile && {
            NSExtensionJavaScriptPreprocessingFile: path.basename(
              preprocessingFile,
              path.extname(preprocessingFile)
            ),
          }),
        },
        NSExtensionPrincipalClass:
          "$(PRODUCT_MODULE_NAME).ShareExtensionViewController",
        NSExtensionPointIdentifier: "com.apple.share-services",
      },
      ShareExtensionBackgroundColor: backgroundColor,
      ShareExtensionHeight: height,
      HostAppScheme: config.scheme,
      WithFirebase: !!googleServicesFile,
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
