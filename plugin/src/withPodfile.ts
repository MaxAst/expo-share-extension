import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";
import { ConfigPlugin, withDangerousMod } from "expo/config-plugins";
import fs from "fs";
import path from "path";

import { getShareExtensionName } from "./index";

export const withPodfile: ConfigPlugin<{
  excludedPackages?: string[];
}> = (config, { excludedPackages }) => {
  const targetName = getShareExtensionName(config);
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podFilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let podfileContent = fs.readFileSync(podFilePath).toString();

      const postInstallBuildSettings = `    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['APPLICATION_EXTENSION_API_ONLY'] = 'NO'
      end
    end`;

      podfileContent = mergeContents({
        tag: "post-install-build-settings",
        src: podfileContent,
        newSrc: postInstallBuildSettings,
        anchor: `react_native_post_install`,
        offset: 7,
        comment: "#",
      }).contents;

      // we always want to exclude expo-updates because it throws this error when the share extension is triggered
      // EXUpdates/AppController.swift:151: Assertion failed: AppController.sharedInstace was called before the module was initialized
      const exclude = excludedPackages?.length
        ? Array.from(new Set(["expo-updates", ...excludedPackages]))
        : ["expo-updates"];

      const useExpoModules = `exclude = ["${exclude.join(`", "`)}"]
  use_expo_modules!(exclude: exclude)`;

      const shareExtensionTarget = `target '${targetName}' do     
  ${useExpoModules}     
  config = use_native_modules!
          
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
  use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']
          
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => podfile_properties['expo.jsEngine'] == nil || podfile_properties['expo.jsEngine'] == 'hermes',
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/..",
    # Temporarily disable privacy file aggregation by default, until React
    # Native 0.74.2 is released with fixes.
    :privacy_file_aggregation_enabled => podfile_properties['apple.privacyManifestAggregationEnabled'] == 'true',
  )
end`;

      podfileContent = mergeContents({
        tag: "share-extension-target",
        src: podfileContent,
        newSrc: shareExtensionTarget,
        anchor: `Pod::UI.warn e`,
        offset: 5,
        comment: "#",
      }).contents;

      fs.writeFileSync(podFilePath, podfileContent);

      return config;
    },
  ]);
};
