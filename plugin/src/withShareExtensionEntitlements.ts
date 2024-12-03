import plist from "@expo/plist";
import { ConfigPlugin, withEntitlementsPlist } from "expo/config-plugins";
import fs from "fs";
import path from "path";

import {
  getAppBundleIdentifier,
  getAppGroup,
  getShareExtensionName,
} from "./index";

export const withShareExtensionEntitlements: ConfigPlugin = (config) => {
  return withEntitlementsPlist(config, (config) => {
    const targetName = getShareExtensionName(config);

    const targetPath = path.join(
      config.modRequest.platformProjectRoot,
      targetName
    );
    const filePath = path.join(targetPath, `${targetName}.entitlements`);

    const bundleIdentifier = getAppBundleIdentifier(config);

    const existingAppGroup =
      config.ios?.entitlements?.["com.apple.security.application-groups"];

    let shareExtensionEntitlements: Record<string, string | string[]> = {
      "com.apple.security.application-groups": existingAppGroup ?? [getAppGroup(bundleIdentifier)],
    };

    if (config.ios?.usesAppleSignIn) {
      shareExtensionEntitlements = {
        ...shareExtensionEntitlements,
        "com.apple.developer.applesignin": ["Default"],
      };
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, plist.build(shareExtensionEntitlements));

    return config;
  });
};
