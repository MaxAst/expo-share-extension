import { XcodeProject } from "expo/config-plugins";

export function addBuildPhases(
  xcodeProject: XcodeProject,
  {
    targetUuid,
    groupName,
    productFile,
    resources,
  }: {
    targetUuid: string;
    groupName: string;
    productFile: {
      uuid: string;
      target: string;
      basename: string;
      group: string;
    };
    resources: string[];
  }
) {
  const buildPath = `"$(CONTENTS_FOLDER_PATH)/ShareExtensions"`;
  const targetType = "app_extension";

  // Add shell script build phase "Start Packager"
  xcodeProject.addBuildPhase(
    [],
    "PBXShellScriptBuildPhase",
    "Start Packager",
    targetUuid,
    {
      shellPath: "/bin/sh",
      shellScript:
        'export RCT_METRO_PORT="${RCT_METRO_PORT:=8081}"\necho "export RCT_METRO_PORT=${RCT_METRO_PORT}" > "${SRCROOT}/../node_modules/react-native/scripts/.packager.env"\nif [ -z "${RCT_NO_LAUNCH_PACKAGER+xxx}" ] ; then\n  if nc -w 5 -z localhost ${RCT_METRO_PORT} ; then\n    if ! curl -s "http://localhost:${RCT_METRO_PORT}/status" | grep -q "packager-status:running" ; then\n      echo "Port ${RCT_METRO_PORT} already in use, packager is either not running or not running correctly"\n      exit 2\n    fi\n  else\n    open "$SRCROOT/../node_modules/react-native/scripts/launchPackager.command" || echo "Can\'t start packager automatically"\n  fi\nfi\n',
    },
    buildPath
  );

  // Sources build phase
  xcodeProject.addBuildPhase(
    ["ShareExtensionViewController.swift"],
    "PBXSourcesBuildPhase",
    groupName,
    targetUuid,
    targetType,
    buildPath
  );

  // Copy files build phase
  xcodeProject.addBuildPhase(
    [],
    "PBXCopyFilesBuildPhase",
    groupName,
    xcodeProject.getFirstTarget().uuid,
    targetType
  );

  xcodeProject.addBuildPhase(
    [],
    "PBXCopyFilesBuildPhase",
    "Copy Files",
    xcodeProject.getFirstTarget().uuid,
    targetType
  );
  xcodeProject.addToPbxCopyfilesBuildPhase(productFile);

  // Frameworks build phase
  xcodeProject.addBuildPhase(
    [],
    "PBXFrameworksBuildPhase",
    groupName,
    targetUuid,
    targetType,
    buildPath
  );

  // Resources build phase
  xcodeProject.addBuildPhase(
    resources,
    "PBXResourcesBuildPhase",
    groupName,
    targetUuid,
    targetType,
    buildPath
  );

  // Add shell script build phase
  xcodeProject.addBuildPhase(
    [],
    "PBXShellScriptBuildPhase",
    "Bundle React Native code and images",
    targetUuid,
    {
      shellPath: "/bin/sh",
      shellScript:
        'export ENTRY_FILE=index.share.js\n/bin/sh -c "$WITH_ENVIRONMENT $REACT_NATIVE_XCODE"\n',
    },
    buildPath
  );
}
