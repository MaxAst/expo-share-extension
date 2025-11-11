import { ConfigPlugin, withInfoPlist } from "@expo/config-plugins";

import { getAppBundleIdentifier, getAppGroup } from "./index";

export const withAppInfoPlist: ConfigPlugin = (config) => {
  return withInfoPlist(config, (config) => {
    const bundleIdentifier = getAppBundleIdentifier(config);

    config.modResults["AppGroup"] = getAppGroup(bundleIdentifier);
    config.modResults["AppGroupIdentifier"] = bundleIdentifier;

    return config;
  });
};
