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
  fonts: string[];
  googleServicesFile?: string;
  preprocessingFile?: string;
}> = (config, { fonts = [], googleServicesFile, preprocessingFile }) => {
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

    const resources = fonts.map((font: string) => path.basename(font));

    const googleServicesFilePath = googleServicesFile
      ? path.resolve(projectRoot, googleServicesFile)
      : undefined;

    if (googleServicesFile) {
      resources.push("GoogleService-Info.plist");
    }

    const preprocessingFilePath = preprocessingFile
      ? path.resolve(projectRoot, preprocessingFile)
      : undefined;

    if (preprocessingFile) {
      resources.push(path.basename(preprocessingFile));
    }

    const xCConfigurationList = addXCConfigurationList(xcodeProject, {
      targetName,
      currentProjectVersion: config.ios?.buildNumber || "1",
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
      fonts,
      googleServicesFilePath,
      preprocessingFilePath,
    });

    addBuildPhases(xcodeProject, {
      targetUuid,
      groupName,
      productFile,
      resources,
    });

    return config;
  });
};
