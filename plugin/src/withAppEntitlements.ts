import { ConfigPlugin, withEntitlementsPlist } from "@expo/config-plugins";

import { getAppBundleIdentifier, getAppGroups } from "./index";

export const withAppEntitlements: ConfigPlugin = (config) => {
  return withEntitlementsPlist(config, (config) => {
    const bundleIdentifier = getAppBundleIdentifier(config);

    config.modResults["com.apple.security.application-groups"] =
      getAppGroups(bundleIdentifier);

    return config;
  });
};
