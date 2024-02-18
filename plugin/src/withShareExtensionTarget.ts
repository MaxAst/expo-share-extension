import { ConfigPlugin } from "@expo/config-plugins";
import { withXcodeProject } from "expo/config-plugins";
import path from "path";

import {
  getShareExtensionBundleIdentifier,
  getShareExtensionName,
} from "./index";
import { addBuildPhases } from "./xcode/addBuildPhases";
import { addPbxGroup } from "./xcode/addPbxGroup";
import { addProductFile } from "./xcode/addProductFile";
import { addTargetDependency } from "./xcode/addTargetDependency";
import { addToPbxNativeTargetSection } from "./xcode/addToPbxNativeTargetSection";
import { addToPbxProjectSection } from "./xcode/addToPbxProjectSection";
import { addXCConfigurationList } from "./xcode/addToXCConfigurationList";

export const withShareExtensionTarget: ConfigPlugin<{
  googleServicesFile?: string;
  fonts: string[];
}> = (config, { googleServicesFile, fonts = [] }) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;

    const targetName = getShareExtensionName(config);
    const bundleIdentifier = getShareExtensionBundleIdentifier(config);
    const marketingVersion = config.version;

    const targetUuid = xcodeProject.generateUuid();
    const groupName = "Embed Foundation Extensions";
    const { platformProjectRoot, projectRoot } = config.modRequest;

    if (config.ios?.googleServicesFile && !googleServicesFile) {
      console.warn(
        "Warning: No Google Services file specified for Share Extension"
      );
    }

    const googleServicesFilePath = googleServicesFile
      ? path.resolve(projectRoot, googleServicesFile)
      : undefined;

    const xCConfigurationList = addXCConfigurationList(xcodeProject, {
      targetName,
      currentProjectVersion: config.ios!.buildNumber || "1",
      bundleIdentifier,
      marketingVersion,
    });

    const productFile = addProductFile(xcodeProject, {
      targetName,
      groupName,
    });

    const target = addToPbxNativeTargetSection(xcodeProject, {
      targetName,
      targetUuid,
      productFile,
      xCConfigurationList,
    });

    addToPbxProjectSection(xcodeProject, target);

    addTargetDependency(xcodeProject, target);

    addPbxGroup(xcodeProject, {
      targetName,
      platformProjectRoot,
      googleServicesFilePath,
      fonts,
    });

    addBuildPhases(xcodeProject, {
      targetUuid,
      groupName,
      productFile,
      resources: googleServicesFilePath
        ? [
            "GoogleService-Info.plist",
            ...fonts.map((font: string) => path.basename(font)),
          ]
        : fonts.map((font: string) => path.basename(font)),
    });

    return config;
  });
};
