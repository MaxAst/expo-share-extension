import { ConfigPlugin } from "@expo/config-plugins";
import { withXcodeProject } from "expo/config-plugins";

import { getShareExtensionName } from "./index";

export const withShareExtensionTarget: ConfigPlugin = (config) => {
  const extensionName = getShareExtensionName(config);

  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;

    const target = xcodeProject.addTarget(
      extensionName,
      "app_extension",
      extensionName
    );

    return config;
  });
};
