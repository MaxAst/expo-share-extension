import { ConfigPlugin, withEntitlementsPlist } from "@expo/config-plugins";

import { getAppBundleIdentifier, getAppGroup } from "./index";

export const withAppEntitlements: ConfigPlugin = (config) => {
  return withEntitlementsPlist(config, (config) => {
    const bundleIdentifier = getAppBundleIdentifier(config);

    if (config.ios?.entitlements?.["com.apple.security.application-groups"]) {
      return config;
    }

    config.modResults["com.apple.security.application-groups"] = [
      getAppGroup(bundleIdentifier),
    ];

    return config;
  });
};
