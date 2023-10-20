import {
  ConfigPlugin,
  IOSConfig,
  withEntitlementsPlist,
  withXcodeProject,
} from "expo/config-plugins";

const getAppGroups = (identifier: string) => [`group.${identifier}`];

type iOSExtensionConfig = {
  targetName: string;
  bundleIdentifier: string;
  entitlements: Record<string, string>;
};

const withShareExtension: ConfigPlugin = (config) => {
  const bundleIdentifier = `${config.ios?.bundleIdentifier}.ShareExtension`;
  const targetName = `${IOSConfig.XcodeUtils.sanitizedName(
    config.name
  )}ShareExtension`;

  config = withXcodeProject(config, (config) => {
    console.log(JSON.stringify(config.modResults, null, 2));
    return config;
  });

  // config = withInfoPlist(config, (config) => {
  //   config.modResults["MY_CUSTOM_API_KEY"] = apiKey;
  //   return config;
  // });

  // config = withAndroidManifest(config, (config) => {
  //   const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
  //     config.modResults
  //   );

  //   AndroidConfig.Manifest.addMetaDataItemToMainApplication(
  //     mainApplication,
  //     "MY_CUSTOM_API_KEY",
  //     apiKey
  //   );
  //   return config;
  // });

  config = withEntitlementsPlist(config, async (config) => {
    const appIdentifier = config.ios?.bundleIdentifier!;
    config.modResults["com.apple.security.application-groups"] =
      getAppGroups(appIdentifier);
    return config;
  });

  // finally, update the app config to make sure the share extension is in appExtensions: https://docs.expo.dev/build-reference/app-extensions
  const iosExtensions: iOSExtensionConfig[] =
    config.extra?.eas?.build?.experimental?.ios?.appExtensions;

  const shareExtensionConfig = iosExtensions?.find(
    (extension) => extension.targetName === targetName
  );

  return {
    ...config,
    extra: {
      ...config.extra,
      eas: {
        ...config.extra?.eas,
        build: {
          ...config.extra?.eas?.build,
          experimental: {
            ...config.extra?.eas?.build?.experimental,
            ios: {
              ...config.extra?.eas?.build?.experimental?.ios,
              appExtensions: [
                {
                  ...(shareExtensionConfig ?? {
                    targetName,
                    bundleIdentifier,
                  }),
                  entitlements: {
                    ...shareExtensionConfig?.entitlements,
                    "com.apple.security.application-groups":
                      getAppGroups(bundleIdentifier),
                  },
                },
                ...iosExtensions?.filter(
                  (extension) => extension.targetName !== targetName
                ),
              ],
            },
          },
        },
      },
    },
  };
};

export default withShareExtension;
