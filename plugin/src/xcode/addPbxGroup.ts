import { XcodeProject } from "expo/config-plugins";
import fs from "fs";
import path from "path";

export function addPbxGroup(
  xcodeProject: XcodeProject,
  {
    projectName,
    targetName,
    platformProjectRoot,
  }: { projectName: string; targetName: string; platformProjectRoot: string }
) {
  const targetPath = path.join(platformProjectRoot, targetName);

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  copyFileSync(
    path.join(__dirname, "../../swift/ShareExtensionViewController.swift"),
    targetPath
  );

  copyFileSync(
    path.join(platformProjectRoot, projectName, "SplashScreen.storyboard"),
    targetPath
  );

  // Copy Images.xcassets
  const imagesXcassetsSource = path.join(
    platformProjectRoot,
    projectName,
    "Images.xcassets"
  );
  copyFolderRecursiveSync(imagesXcassetsSource, targetPath);

  // Add PBX group
  const { uuid: pbxGroupUuid } = xcodeProject.addPbxGroup(
    [
      "ShareExtensionViewController.swift",
      "Info.plist",
      `${targetName}.entitlements`,
      "SplashScreen.storyboard",
      // "main.jsbundle",
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

function copyFileSync(source: string, target: string) {
  let targetFile = target;

  if (fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
    targetFile = path.join(target, path.basename(source));
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source: string, target: string) {
  const targetPath = path.join(target, path.basename(source));
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    files.forEach((file) => {
      const currentPath = path.join(source, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        copyFolderRecursiveSync(currentPath, targetPath);
      } else {
        copyFileSync(currentPath, targetPath);
      }
    });
  }
}
