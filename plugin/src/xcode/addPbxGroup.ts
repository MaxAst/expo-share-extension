import { XcodeProject } from "expo/config-plugins";
import fs from "fs";
import path from "path";

export function addPbxGroup(
  xcodeProject: XcodeProject,
  {
    targetName,
    platformProjectRoot,
    fonts = [],
    googleServicesFilePath,
    preprocessingFilePath,
  }: {
    targetName: string;
    platformProjectRoot: string;
    fonts: string[];
    googleServicesFilePath?: string;
    preprocessingFilePath?: string;
  },
) {
  const targetPath = path.join(platformProjectRoot, targetName);

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  copyFileSync(
    path.join(__dirname, "../../swift/ShareExtensionViewController.swift"),
    targetPath,
    "ShareExtensionViewController.swift",
  );

  for (const font of fonts) {
    copyFileSync(font, targetPath);
  }

  const files = [
    "ShareExtensionViewController.swift",
    "Info.plist",
    `${targetName}.entitlements`,
    ...fonts.map((font: string) => path.basename(font)),
  ];

  if (googleServicesFilePath?.length) {
    copyFileSync(googleServicesFilePath, targetPath);
    files.push(path.basename(googleServicesFilePath));
  }

  if (preprocessingFilePath?.length) {
    copyFileSync(preprocessingFilePath, targetPath);
    files.push(path.basename(preprocessingFilePath));
  }

  // Add PBX group
  const { uuid: pbxGroupUuid } = xcodeProject.addPbxGroup(
    files,
    targetName,
    targetName,
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
