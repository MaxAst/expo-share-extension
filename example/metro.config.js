// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const { withShareExtension } = require("../metro.js");

const config = getDefaultConfig(__dirname);

// npm v7+ will install ../node_modules/react-native because of peerDependencies.
// To prevent the incompatible react-native bewtween ./node_modules/react-native and ../node_modules/react-native,
// excludes the one from the parent folder when bundling.
config.resolver.blockList = [
  ...Array.from(config.resolver.blockList ?? []),
  new RegExp(path.resolve("..", "node_modules", "react-native")),
];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "./node_modules"),
  path.resolve(__dirname, "../node_modules"),
];

// Custom resolver to handle expo-share-extension
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'expo-share-extension') {
    return {
      filePath: path.resolve(__dirname, '../src/index.ts'),
      type: 'sourceFile',
    };
  }
  
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

// Ensure TypeScript files are properly resolved
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'ts',
  'tsx',
];

config.watchFolders = [path.resolve(__dirname, "..")];

module.exports = withShareExtension(config);
