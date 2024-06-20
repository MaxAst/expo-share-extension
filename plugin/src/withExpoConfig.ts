import { ConfigPlugin } from "@expo/config-plugins";

import {
  getAppBundleIdentifier,
  getAppGroup,
  getShareExtensionBundleIdentifier,
  getShareExtensionName,
} from "./index";

type iOSExtensionConfig = {
  targetName: string;
  bundleIdentifier: string;
  entitlements: Record<string, string>;
};

// extend expo app config with app extension config for our share extension
export const withExpoConfig: ConfigPlugin = (config) => {
  if (!config.ios?.bundleIdentifier) {
    throw new Error("You need to specify ios.bundleIdentifier in app.json.");
  }

  const extensionName = getShareExtensionName(config);
  const extensionBundleIdentifier = getShareExtensionBundleIdentifier(config);
  const appBundleIdentifier = getAppBundleIdentifier(config);

  const iosExtensions: iOSExtensionConfig[] =
    config.extra?.eas?.build?.experimental?.ios?.appExtensions;

  const shareExtensionConfig = iosExtensions?.find(
    (extension) => extension.targetName === extensionName
  );

  return {
    ...config,
    extra: {
      ...(config.extra ?? {}),
      eas: {
        ...(config.extra?.eas ?? {}),
        build: {
          ...(config.extra?.eas?.build ?? {}),
          experimental: {
            ...(config.extra?.eas?.build?.experimental ?? {}),
            ios: {
              ...(config.extra?.eas?.build?.experimental?.ios ?? {}),
              appExtensions: [
                {
                  ...(shareExtensionConfig ?? {
                    targetName: extensionName,
                    bundleIdentifier: extensionBundleIdentifier,
                  }),
                  entitlements: {
                    ...shareExtensionConfig?.entitlements,
                    "com.apple.security.application-groups": [
                      getAppGroup(config.ios?.bundleIdentifier),
                    ],
                    ...(config.ios.usesAppleSignIn && {
                      "com.apple.developer.applesignin": ["Default"],
                    }),
                  },
                },
                ...(iosExtensions?.filter(
                  (extension) => extension.targetName !== extensionName
                ) ?? []),
              ],
            },
          },
        },
      },
      appleApplicationGroup: getAppGroup(appBundleIdentifier),
    },
  };
};
