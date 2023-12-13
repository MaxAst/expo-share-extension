import { ConfigPlugin } from "@expo/config-plugins";
import { withXcodeProject } from "expo/config-plugins";
import fs from "fs";
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

export const withShareExtensionTarget: ConfigPlugin = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;

    const targetName = getShareExtensionName(config);
    const bundleIdentifier = getShareExtensionBundleIdentifier(config);
    const marketingVersion = config.version;

    const targetUuid = xcodeProject.generateUuid();
    const groupName = "Embed Foundation Extensions";
    const { platformProjectRoot, projectRoot } = config.modRequest;

    const googleServicesFilePath = config.ios?.googleServicesFile
      ? path.resolve(projectRoot, config.ios.googleServicesFile)
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
    });

    addBuildPhases(xcodeProject, {
      targetUuid,
      groupName,
      productFile,
      resources: googleServicesFilePath ? ["GoogleService-Info.plist"] : [],
    });

    return config;
  });
};
