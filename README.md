# Expo Share Extension

![npm](https://img.shields.io/npm/v/expo-share-extension.svg)
![License](https://img.shields.io/npm/l/expo-share-extension.svg)
![Downloads](https://img.shields.io/npm/dm/expo-share-extension.svg)
![GitHub stars](https://img.shields.io/github/stars/MaxAst/expo-share-extension.svg)

Create an iOS share extension with a custom view (similar to e.g. Pinterest).

## Installation

1. Install the package

```
npx expo install expo-share-extension
```

2. Update app.json/app.config.js

```
"expo": {
  ...
  "plugins": ["expo-share-extension"],
  ...
}
```

3. Update package.json

```
{
  ...
  "main": "index.js",
  ...
}
```

4. Create an `index.js` in the root of your project

```
import { registerRootComponent } from "expo";
import { AppRegistry } from "react-native";

import App from "./App";
import ShareExtension from "./ShareExtension";

registerRootComponent(App);

AppRegistry.registerComponent("extension", () => ShareExtension);

```

## Development

If you want to contribute to this project, you can use the example app to test your changes. Run the following commands to get started:

1. Start the expo module build in watch mode: `npm run build`
2. Start the config plugin build in watch mode: `npm run build plugin`
3. `cd /example` and generate the iOS project: `npx expo prebuild -p ios`
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
- https://github.com/ajith-ab/react-native-receive-sharing-intent
- https://github.com/timedtext/expo-config-plugin-ios-share-extension
- https://github.com/achorein/expo-share-intent-demo
- https://github.com/andrewsardone/react-native-ios-share-extension
- https://github.com/EvanBacon/pillar-valley/tree/master/targets/widgets
- https://github.com/andrew-levy/react-native-safari-extension
- https://github.com/bndkt/react-native-app-clip
