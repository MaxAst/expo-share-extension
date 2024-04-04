import { XcodeProject } from "expo/config-plugins";

export function addProductFile(
  xcodeProject: XcodeProject,
  { targetName }: { targetName: string; groupName: string },
) {
  const productFile = xcodeProject.addProductFile(targetName, {
    group: "Copy Files",
    explicitFileType: "wrapper.app-extension",
  });

  xcodeProject.addToPbxBuildFileSection(productFile);

  return productFile;
}
