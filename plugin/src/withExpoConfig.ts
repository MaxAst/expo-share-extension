import { ConfigPlugin } from "@expo/config-plugins";

import {
  getAppGroups,
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
  if (!config.ios?.bundleIdentifier) throw new Error("No bundle identifier");

  const extensionName = getShareExtensionName(config);
  const extensionBundleIdentifier = getShareExtensionBundleIdentifier(config);

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
                    extensionName,
                    extensionBundleIdentifier,
                  }),
                  entitlements: {
                    ...shareExtensionConfig?.entitlements,
                    "com.apple.security.application-groups": getAppGroups(
                      extensionBundleIdentifier
                    ),
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
    },
  };
};
