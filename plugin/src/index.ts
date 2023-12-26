import { type ExpoConfig } from "@expo/config-types";
import { ConfigPlugin, IOSConfig, withPlugins } from "expo/config-plugins";
import { z } from "zod";

import { withAppEntitlements } from "./withAppEntitlements";
import { withExpoConfig } from "./withExpoConfig";
import { withPodfile } from "./withPodfile";
import { withShareExtensionEntitlements } from "./withShareExtensionEntitlements";
import { withShareExtensionInfoPlist } from "./withShareExtensionInfoPlist";
import { withShareExtensionTarget } from "./withShareExtensionTarget";

export const getAppGroups = (identifier: string) => [`group.${identifier}`];

export const getAppBundleIdentifier = (config: ExpoConfig) => {
  if (!config.ios?.bundleIdentifier) {
    throw new Error("No bundle identifier");
  }
  return config.ios?.bundleIdentifier;
};

export const getShareExtensionBundleIdentifier = (config: ExpoConfig) => {
  return `${getAppBundleIdentifier(config)}.ShareExtension`;
};

export const getShareExtensionName = (config: ExpoConfig) => {
  return `${IOSConfig.XcodeUtils.sanitizedName(config.name)}ShareExtension`;
};

export const getShareExtensionEntitlementsFileName = (config: ExpoConfig) => {
  const name = getShareExtensionName(config);
  return `${name}.entitlements`;
};

const rgbaSchema = z.object({
  red: z.number().min(0).max(255),
  green: z.number().min(0).max(255),
  blue: z.number().min(0).max(255),
  alpha: z.number().min(0).max(1),
});

export type BackgroundColor = z.infer<typeof rgbaSchema>;

const withShareExtension: ConfigPlugin<{
  backgroundColor?: BackgroundColor;
  excludedPackages?: string[];
  googleServicesFile?: string;
}> = (config, props) => {
  if (props?.backgroundColor) {
    rgbaSchema.parse(props.backgroundColor);
  }

  return withPlugins(config, [
    withExpoConfig,
    withAppEntitlements,
    [withPodfile, { excludedPackages: props?.excludedPackages ?? [] }],
    [
      withShareExtensionInfoPlist,
      {
        backgroundColor: props?.backgroundColor,
      },
    ],
    withShareExtensionEntitlements,
    [
      withShareExtensionTarget,
      {
        googleServicesFile: props?.googleServicesFile,
      },
    ],
  ]);
};

export default withShareExtension;
