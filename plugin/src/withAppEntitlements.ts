import { ConfigPlugin, withEntitlementsPlist } from "@expo/config-plugins";

import { getAppGroups, getShareExtensionBundleIdentifier } from "./index";

export const withAppEntitlements: ConfigPlugin = (config) => {
  return withEntitlementsPlist(config, (config) => {
    const bundleIdentifier = getShareExtensionBundleIdentifier(config);

    config.modResults["com.apple.security.application-groups"] =
      getAppGroups(bundleIdentifier);

    return config;
  });
};
