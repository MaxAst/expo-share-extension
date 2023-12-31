import { XcodeProject } from "expo/config-plugins";
import fs from "fs";
import path from "path";

export function addPbxGroup(
  xcodeProject: XcodeProject,
  {
    targetName,
    platformProjectRoot,
    googleServicesFilePath,
  }: {
    targetName: string;
    platformProjectRoot: string;
    googleServicesFilePath?: string;
  }
) {
  const targetPath = path.join(platformProjectRoot, targetName);

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  copyFileSync(
    path.join(
      __dirname,
      `../../swift/ShareExtensionViewController${
        googleServicesFilePath ? "WithFirebase" : ""
      }.swift`
    ),
    targetPath,
    "ShareExtensionViewController.swift"
  );

  if (googleServicesFilePath?.length) {
    copyFileSync(googleServicesFilePath, targetPath);
  }

  // Add PBX group
  const { uuid: pbxGroupUuid } = xcodeProject.addPbxGroup(
    googleServicesFilePath
      ? [
          "ShareExtensionViewController.swift",
          "Info.plist",
          `${targetName}.entitlements`,
          "GoogleService-Info.plist",
        ]
      : [
          "ShareExtensionViewController.swift",
          "Info.plist",
          `${targetName}.entitlements`,
        ],
    targetName,
    targetName
  );

  // Add PBXGroup to top level group
  const groups = xcodeProject.hash.project.objects["PBXGroup"];
  if (pbxGroupUuid) {
    Object.keys(groups).forEach(function (key) {
      if (groups[key].name === undefined && groups[key].path === undefined) {
        xcodeProject.addToPbxGroup(pbxGroupUuid, key);
      }
    });
  }
}

function copyFileSync(source: string, target: string, basename?: string) {
  let targetFile = target;

  if (fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
    targetFile = path.join(target, basename ?? path.basename(source));
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}
