import { ConfigPlugin, withEntitlementsPlist } from "@expo/config-plugins";

import { getAppGroup } from "./index";

export const withAppEntitlements: ConfigPlugin = (config) => {
  return withEntitlementsPlist(config, (config) => {
    if (config.ios?.entitlements?.["com.apple.security.application-groups"]) {
      return config;
    }

    config.modResults["com.apple.security.application-groups"] = [
      getAppGroup(config),
    ];

    return config;
  });
};
