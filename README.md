# Expo Share Extension

![npm](https://img.shields.io/npm/v/expo-share-extension.svg)
![License](https://img.shields.io/npm/l/expo-share-extension.svg)
![Downloads](https://img.shields.io/npm/dm/expo-share-extension.svg)
![GitHub stars](https://img.shields.io/github/stars/MaxAst/expo-share-extension.svg)

Create an [iOS share extension](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/Share.html) with a custom view (similar to e.g. Pinterest). Supports Apple Sign-In, [React Native Firebase](https://rnfirebase.io/) (including shared auth session via access groups), custom background, custom height, and custom fonts.

The shared data is passed to the share extension's root component as an initial prop based on this type:

```ts
export type InitialProps = {
  images?: string[];
  videos?: string[];
  text?: string;
  url?: string;
  preprocessingResults?: unknown;
};
```

You can import `InitialProps` from `expo-share-extension` to use it as a type for your root component's props.

The config plugin supports almost all [NSExtensionActivationRules](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/AppExtensionKeys.html#//apple_ref/doc/uid/TP40014212-SW10). It currently supports.

- `NSExtensionActivationSupportsText`, which is triggered e.g. when sharing a WhatsApp message's contents or when selecting a text on a webpage and sharing it via the iOS tooltip menu. The result is passed as the `text` field in the initial props
- `NSExtensionActivationSupportsWebURLWithMaxCount: 1`, which is triggered when using the share button in Safari. The result is passed as the `url` field in the initial props
- `NSExtensionActivationSupportsWebPageWithMaxCount: 1`, which is triggered when using the share button in Safari. The result is passed as the `preprocessingResults` field in the initial props. When using this rule, you will no longer receive `url` as part of initial props, unless you extract it in your preprocessing JavaScript file. You can learn more about this in the [Preprocessing JavaScript](#preprocessing-javascript) section.
- `NSExtensionActivationSupportsImageWithMaxCount: 1`, which is triggered when using the share button on an image. The result is passed as part of the `images` array in the initial props.
- `NSExtensionActivationSupportsMovieWithMaxCount: 1`, which is triggered when using the share button on a video. The result is passed as part of the `videos` array in the initial props.

You need to list the activation rules you want to use in your `app.json`/`app.config.(j|t)s` file like so:

```json
[
  "expo-share-extension",
  {
    "activationRules": [
      {
        "type": "image",
        "max": 2
      },
      {
        "type": "video",
        "max": 1
      },
      {
        "type": "text"
      },
      {
        "type": "url",
        "max": 1
      }
    ]
  }
]
```

If no values for `max` are provided, the default value is `1`. The `type` field can be one of the following: `image`, `video`, `text`, `url`.

If you do not specify the `activationRules` option, `expo-share-extension` enables the url rules by default, for backwards compatibility.

Contributions to support the remaining [NSExtensionActivationRules](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/AppExtensionKeys.html#//apple_ref/doc/uid/TP40014212-SW10) (files and attachaments) are welcome!

**Note**: The share extension does not support `expo-updates` as it causes the share extension to crash. Since version `1.5.0`, `expo-updates` is excluded from the share extension's bundle by default. If you're using an older version, you must exclude it by adding it to the `excludedPackages` option in your `app.json`/`app.config.(j|t)s`. See the [Exlude Expo Modules](#exlude-expo-modules) section for more information.

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
  config.transformer.getTransformOptions = () => ({
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

### Redirects to App

If you want to redirect the user to your main app instead of opening a custom view when the share extension is triggered, you can use the `redirect` field in any of the rules you specifiy in the `activationRules` option. One common example would be to redirect the user to the main app if they share media like images or videos, which consume too much memory to display them in a custom view of a share extension, which have a memory limit of 100MB. To do this with e.g. expo-router, add the following to your `app.json`/`app.config.(j|t)s`:

```json
[
  "expo-share-extension",
  {
    "activationRules": [
      {
        "type": "image",
        "max": 2,
        "redirect": "/(tabs)/post"
      },
      {
        "type": "video",
        "max": 1,
        "redirect": "/(tabs)/post"
      }
    ]
  }
]
```

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

You can share a firebase auth session between your main app and the share extension by using the [`useUserAccessGroup` hook](https://rnfirebase.io/reference/auth#useUserAccessGroup). The value for `userAccessGroup` is your main app's bundle ID with the `group.` prefix, e.g. `group.com.example.app`. For a full example, check [this](examples/with-firebase/README.md).

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

### Preprocessing JavaScript

As explained in [Accessing a Webpage](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/ExtensionScenarios.html#//apple_ref/doc/uid/TP40014214-CH21-SW12), we can use a JavaScript file to preprocess the webpage before the share extension is activated. This is useful if you want to extract the title and URL of the webpage, for example. To use this feature, add the following to your `app.json`/`app.config.(j|t)s`:

```json
[
  "expo-share-extension",
    {
      "preprocessingFile": "./preprocessing.js"
    },
],
```

The `preprocessingFile` option adds [`NSExtensionActivationSupportsWebPageWithMaxCount: 1`](https://developer.apple.com/documentation/bundleresources/information_property_list/nsextension/nsextensionattributes/nsextensionactivationrule/nsextensionactivationsupportswebpagewithmaxcount) as an `NSExtensionActivationRule`. Your preprocessing file must adhere to some rules:

1. You must create a class with a `run` method, which receives an object with a `completionFunction` method as its argument. This `completionFunction` method must be invoked at the end of your `run` method. The argument you pass to it, is what you will receive as the `preprocessingResults` object as part of initial props.

```javascript
class ShareExtensionPreprocessor {
  run(args) {
    args.completionFunction({
      title: document.title,
    });
  }
}
```

2. Your file must create an instance of a class using `var`, so that it is globally accessible.

```javascript
var ExtensionPreprocessingJS = new ShareExtensionPreprocessor();
```

For a full example, check [this](examples/with-preprocessing/README.md).

**WARNING:** Using this option enables [`NSExtensionActivationSupportsWebPageWithMaxCount: 1`](https://developer.apple.com/documentation/bundleresources/information_property_list/nsextension/nsextensionattributes/nsextensionactivationrule/nsextensionactivationsupportswebpagewithmaxcount) and this is mutually exclusive with [`NSExtensionActivationSupportsWebURLWithMaxCount: 1`](https://developer.apple.com/documentation/bundleresources/information_property_list/nsextension/nsextensionattributes/nsextensionactivationrule/nsextensionactivationsupportsweburlwithmaxcount), which `expo-share-extension` enables by default. This means that once you set the `preprocessingFile` option, you will no longer receive `url` as part of initial props. However, you can still get the URL via `preprocessingResults` by using `window.location.href` in your preprocessing file:

```javascript
class ShareExtensionPreprocessor {
  run(args) {
    args.completionFunction({
      url: window.location.href,
      title: document.title,
    });
  }
}
```

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
