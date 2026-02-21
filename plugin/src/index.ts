import { type ExpoConfig } from "@expo/config-types";
import { ConfigPlugin, IOSConfig, withPlugins } from "expo/config-plugins";
import * as v from "valibot";

import { withAppEntitlements } from "./withAppEntitlements";
import { withAppInfoPlist } from "./withAppInfoPlist";
import { withExpoConfig } from "./withExpoConfig";
import { withPodfile } from "./withPodfile";
import { withShareExtensionEntitlements } from "./withShareExtensionEntitlements";
import { withShareExtensionInfoPlist } from "./withShareExtensionInfoPlist";
import { withShareExtensionTarget } from "./withShareExtensionTarget";

/**
 * Get the app group for the app by:
 * - Checking if AppGroup or AppGroupIdentifier is set in the info.plist configuation value.
 * - Falling back to the bundle identifier.
 * 
 * This allows to user to control the app group in case it doesn't match their
 * bundle identifier.
 */
export const getAppGroup = (config: ExpoConfig) => {
  if (config.ios?.infoPlist?.AppGroup) {
    return config.ios?.infoPlist?.AppGroup;
  } else if (config.ios?.infoPlist?.AppGroupIdentifier) {
    return config.ios?.infoPlist?.AppGroupIdentifier;
  }
  return `group.${getAppBundleIdentifier(config)}`;
};

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

const rgbaSchema = v.object({
  red: v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
  green: v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
  blue: v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
  alpha: v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
});

export type BackgroundColor = v.InferOutput<typeof rgbaSchema>;

const heightSchema = v.pipe(v.number(), v.minValue(50), v.maxValue(1000));

export type Height = v.InferOutput<typeof heightSchema>;

type ActivationType = "image" | "video" | "text" | "url" | "file";

export type ActivationRule = {
  type: ActivationType;
  max?: number;
};

const withShareExtension: ConfigPlugin<{
  activationRules?: ActivationRule[];
  backgroundColor?: BackgroundColor;
  height?: Height;
  excludedPackages?: string[];
  googleServicesFile?: string;
  preprocessingFile?: string;
}> = (config, props) => {
  if (props?.backgroundColor) {
    v.parse(rgbaSchema, props.backgroundColor);
  }

  if (props?.height) {
    v.parse(heightSchema, props.height);
  }

  const expoFontPlugin = config.plugins?.find(
    (p) => Array.isArray(p) && p.length && p.at(0) === "expo-font",
  );

  const fonts = expoFontPlugin?.at(1).fonts ?? [];

  return withPlugins(config, [
    withExpoConfig,
    withAppEntitlements,
    withAppInfoPlist,
    [withPodfile, { excludedPackages: props?.excludedPackages ?? [] }],
    [
      withShareExtensionInfoPlist,
      {
        fonts,
        activationRules: props?.activationRules,
        backgroundColor: props?.backgroundColor,
        height: props?.height,
        preprocessingFile: props?.preprocessingFile,
        googleServicesFile: props?.googleServicesFile,
      },
    ],
    withShareExtensionEntitlements,
    [
      withShareExtensionTarget,
      {
        fonts,
        googleServicesFile: props?.googleServicesFile,
        preprocessingFile: props?.preprocessingFile,
      },
    ],
  ]);
};

export default withShareExtension;
