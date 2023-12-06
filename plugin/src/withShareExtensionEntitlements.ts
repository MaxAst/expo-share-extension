import { ConfigPlugin, withInfoPlist } from "@expo/config-plugins";
import plist from "@expo/plist";
import fs from "fs";
import path from "path";

import {
  getAppBundleIdentifier,
  getAppGroups,
  getShareExtensionName,
} from "./index";

export const withShareExtensionEntitlements: ConfigPlugin = (config) => {
  return withInfoPlist(config, (config) => {
    const targetName = getShareExtensionName(config);

    const targetPath = path.join(
      config.modRequest.platformProjectRoot,
      targetName
    );
    const filePath = path.join(targetPath, `${targetName}.entitlements`);

    const bundleIdentifier = getAppBundleIdentifier(config);

    const shareExtensionEntitlements = {
      "com.apple.security.application-groups": getAppGroups(bundleIdentifier),
    };

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, plist.build(shareExtensionEntitlements));

    return config;
  });
};
