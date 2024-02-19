# Expo Share Extension

![npm](https://img.shields.io/npm/v/expo-share-extension.svg)
![License](https://img.shields.io/npm/l/expo-share-extension.svg)
![Downloads](https://img.shields.io/npm/dm/expo-share-extension.svg)
![GitHub stars](https://img.shields.io/github/stars/MaxAst/expo-share-extension.svg)

Create an [iOS share extension](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/Share.html) with a custom view (similar to e.g. Pinterest). Supports Apple Sign-In, [React Native Firebase](https://rnfirebase.io/) (including shared auth session via access groups), custom background, custom height, and custom fonts.

**Note**: The extension currently only works for Safari's share menu, where a `url` prop is passed to the extension's root component as an initial prop. Contributions to support more [NSExtensionActivationRules](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/AppExtensionKeys.html#//apple_ref/doc/uid/TP40014212-SW10) are welcome!

https://github.com/MaxAst/expo-share-extension/assets/13224092/e5a6fb3d-6c85-4571-99c8-4efe0f862266

## Installation

Install the package

```sh
npx expo install expo-share-extension
```

Update app.json/app.config.js

```json
"expo": {
  ...
  "plugins": ["expo-share-extension"],
  ...
}
```

Update package.json

```json
{
  ...
  "main": "index.js",
  ...
}
```

Create an `index.js` in the root of your project

```ts
import { registerRootComponent } from "expo";

import App from "./App";

registerRootComponent(App);
```

or if you're using expo-router:

```ts
import "expo-router/entry";
```

Create an `index.share.js` in the root of your project

```ts
import { AppRegistry } from "react-native";

// could be any component you want to use as the root component of your share extension's bundle
import ShareExtension from "./ShareExtension";

// IMPORTANT: the first argument to registerComponent, must be "shareExtension"
AppRegistry.registerComponent("shareExtension", () => ShareExtension);
```

Update metro.config.js so that it resolves index.share.js as the entry point for the share extension

```js
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/**
 * Add support for share.js as a recognized extension to the Metro config.
 * This allows creating an index.share.js entry point for our iOS share extension
 *
 * @param {import('expo/metro-config').MetroConfig} config
 * @returns {import('expo/metro-config').MetroConfig}
 */
function withShareExtension(config) {
  config.transformer.getTransformOptions = async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
    resolver: {
      sourceExts: [...config.resolver.sourceExts, "share.js"], // Add 'share.js' as a recognized extension
    },
  });
  return config;
}

module.exports = withShareExtension(getDefaultConfig(__dirname), {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});
```

Need a way to close the share extension? Use the `close` method from `expo-share-extension`:

```ts
import { close } from "expo-share-extension"
import { Button, Text, View } from "react-native";

// if ShareExtension is your root component, url is available as an initial prop
export default function ShareExtension({ url }: { url: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text>{url}</Text>
      <Button title="Close" onPress={close} />
    </View>
  );
}
```

## Options

### Exlude Expo Modules

Exclude unneeded expo modules to reduce the share extension's bundle size by adding the following to your `app.json`/`app.config.(j|t)s`:

```json
[
  "expo-share-extension",
    {
      "excludedPackages": [
        "expo-dev-client",
        "expo-splash-screen",
        "expo-updates",
        "expo-font",
      ],
    },
],
```

### React Native Firebase

Using [React Native Firebase](https://rnfirebase.io/)? Given that share extensions are separate iOS targets, they have their own bundle IDs, so we need to create a _dedicated_ GoogleService-Info.plist in the Firebase console, just for the share extension target. The bundle ID of your share extension is your existing bundle ID with `.ShareExtension` as the suffix, e.g. `com.example.app.ShareExtension`.

```json
[
  "expo-share-extension",
    {
      "googleServicesFile": "./path-to-your-separate/GoogleService-Info.plist",
    },
],
```

You can share a firebase auth session between your main app and the share extension by using the [`useUserAccessGroup` hook](https://rnfirebase.io/reference/auth#useUserAccessGroup). The value for `userAccessGroup` is your main app's bundle ID with the `group.` prefix, e.g. `group.com.example.app`.

### Custom Background Color

Want to customize the share extension's background color? Add the following to your `app.json`/`app.config.(j|t)s`:

```json
[
  "expo-share-extension",
    {
      "backgroundColor": {
        "red": 255,
        "green": 255,
        "blue": 255,
        "alpha": 0.8 // if 0, the background will be transparent
      },
    },
],
```

### Custom Height

Want to customize the share extension's height? Do this in your `app.json`/`app.config.(j|t)s`:

```json
[
  "expo-share-extension",
    {
      "height": 500
    },
],
```

### Custom Fonts

This plugin automatically adds custom fonts to the share extension target if they are [embedded in the native project](https://docs.expo.dev/develop/user-interface/fonts/#embed-font-in-a-native-project) via the `expo-font` config plugin.

It currently does not support custom fonts that are [loaded at runtime](https://docs.expo.dev/develop/user-interface/fonts/#load-font-at-runtime), due to an `NSURLSesssion` [error](https://stackoverflow.com/questions/26172783/upload-nsurlsesssion-becomes-invalidated-in-sharing-extension-in-ios8-with-error). To fix this, Expo would need to support defining a [`sharedContainerIdentifier`](https://developer.apple.com/documentation/foundation/nsurlsessionconfiguration/1409450-sharedcontaineridentifier) for `NSURLSessionConfiguration` instances, where the value would be set to the main app's and share extension's app group identifier (e.g. `group.com.example.app`).

## Development

If you want to contribute to this project, you can use the example app to test your changes. Run the following commands to get started:

1. Start the expo module build in watch mode: `npm run build`
2. Start the config plugin build in watch mode: `npm run build plugin`
3. `cd /example` and generate the iOS project: `npm run prebuild`
4. Run the app from the /example folder: `npm run ios`

### Troubleshooting

#### Clear XCode Cache

1. navigate to `~/Library/Developer/Xcode/DerivedData/`
2. `rm -rf` folders that are prefixed with your project name

#### Clear CocoaPods Cache

1. `pod cache clean --all`
2. `pod deintegrate`

#### Attach Debugger to Share Extension Process:

1. In XCode in the top menu, navigate to Debug > Attach to Process.
2. In the submenu, you should see a list of running processes. Find your share extension's name in this list. If you don't see it, you can try typing its name into the search box at the bottom.
3. Once you've located your share extension's process, click on it to attach the debugger to that process.
4. With the debugger attached, you can also set breakpoints within your share extension's code. If these breakpoints are hit, Xcode will pause execution and allow you to inspect variables and step through your code, just like you would with your main app.

#### Check Device Logs

1. Open the Console app from the Applications/Utilities folder
2. Select your device from the Devices list
3. Filter the log messages by process name matching your share extension target name

#### Check Crash Logs

1. On your Mac, open Finder.
2. Select Go > Go to Folder from the menu bar or press Shift + Cmd + G.
3. Enter ~/Library/Logs/DiagnosticReports/ and click Go.
4. Look for any recent crash logs related to your share extension. These logs should have a .crash or .ips extension.

## Credits

This project would not be possible without existing work in the react native ecosystem. I'd like to give credit to the following projects and their authors:

- https://github.com/Expensify/react-native-share-menu
- https://github.com/andrewsardone/react-native-ios-share-extension
- https://github.com/alinz/react-native-share-extension
- https://github.com/ajith-ab/react-native-receive-sharing-intent
- https://github.com/timedtext/expo-config-plugin-ios-share-extension
- https://github.com/achorein/expo-share-intent-demo
- https://github.com/andrewsardone/react-native-ios-share-extension
- https://github.com/EvanBacon/pillar-valley/tree/master/targets/widgets
- https://github.com/andrew-levy/react-native-safari-extension
- https://github.com/bndkt/react-native-app-clip
