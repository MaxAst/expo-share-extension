import { ConfigPlugin, withInfoPlist } from "@expo/config-plugins";

import { getAppGroup } from "./index";

export const withAppInfoPlist: ConfigPlugin = (config) => {
  return withInfoPlist(config, (config) => {
    config.modResults["AppGroup"] = getAppGroup(config);
    config.modResults["AppGroupIdentifier"] = getAppGroup(config);

    return config;
  });
};
