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

const heightSchema = z.number().int().min(50).max(1000);

export type Height = z.infer<typeof heightSchema>;

const withShareExtension: ConfigPlugin<{
  backgroundColor?: BackgroundColor;
  height?: Height;
  excludedPackages?: string[];
  googleServicesFile?: string;
  preprocessingFile?: string;
}> = (config, props) => {
  if (props?.backgroundColor) {
    rgbaSchema.parse(props.backgroundColor);
  }

  const expoFontPlugin = config.plugins?.find(
    (p) => Array.isArray(p) && p.length && p.at(0) === "expo-font"
  );

  const fonts = expoFontPlugin?.at(1).fonts ?? [];

  return withPlugins(config, [
    withExpoConfig,
    withAppEntitlements,
    [withPodfile, { excludedPackages: props?.excludedPackages ?? [] }],
    [
      withShareExtensionInfoPlist,
      {
        fonts,
        backgroundColor: props?.backgroundColor,
        height: props?.height,
        preprocessingFile: props.preprocessingFile,
      },
    ],
    withShareExtensionEntitlements,
    [
      withShareExtensionTarget,
      {
        fonts,
        googleServicesFile: props?.googleServicesFile,
        preprocessingFile: props.preprocessingFile,
      },
    ],
  ]);
};

export default withShareExtension;
