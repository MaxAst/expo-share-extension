import { type ExpoConfig } from "@expo/config-types";
import { ConfigPlugin, IOSConfig, withPlugins } from "expo/config-plugins";

import { withAppEntitlements } from "./withAppEntitlements";
import { withExpoConfig } from "./withExpoConfig";
import { withShareExtensionEntitlements } from "./withShareExtensionEntitlements";
import { withShareExtensionInfoPlist } from "./withShareExtensionInfoPlist";
import { withShareExtensionTarget } from "./withShareExtensionTarget";

export const getAppGroups = (identifier: string) => [`group.${identifier}`];

export const getShareExtensionBundleIdentifier = (config: ExpoConfig) => {
  if (!config.ios?.bundleIdentifier) {
    throw new Error("No bundle identifier");
  }
  return `${config.ios?.bundleIdentifier}.ShareExtension`;
};

export const getShareExtensionName = (config: ExpoConfig) => {
  return `${IOSConfig.XcodeUtils.sanitizedName(config.name)}ShareExtension`;
};

export const getShareExtensionInfoPlistFileName = (config: ExpoConfig) => {
  const name = getShareExtensionName(config);
  return `${name}-Info.plist`;
};

export const getShareExtensionEntitlementsFileName = (config: ExpoConfig) => {
  const name = getShareExtensionName(config);
  return `${name}.entitlements`;
};

const withShareExtension: ConfigPlugin = (config) => {
  return withPlugins(config, [
    withExpoConfig,
    withAppEntitlements,
    withShareExtensionInfoPlist,
    withShareExtensionEntitlements,
    withShareExtensionTarget,
  ]);
};

export default withShareExtension;
