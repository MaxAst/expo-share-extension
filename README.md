# Expo Share Extension

## Intro

I want to build an app, that works similar to Pinterest, where users can save links of clothing items that they've come across while shopping online.

For this, I need to build an expo config plugin, that allows me to create an iOS share extension with a custom UI. The plugin will generate the necessary files and add them to my project.

## Troubleshooting

### Clear XCode Cache

1. navigate to `~/Library/Developer/Xcode/DerivedData/`
2. `rm -rf` folders that are prefixed with your project name

### Attach Debugger to Share Extension Process:

1. In XCode in the top menu, navigate to Debug > Attach to Process.
2. In the submenu, you should see a list of running processes. Find your share extension's name in this list. If you don't see it, you can try typing its name into the search box at the bottom.
3. Once you've located your share extension's process, click on it to attach the debugger to that process.
4. With the debugger attached, you can also set breakpoints within your share extension's code. If these breakpoints are hit, Xcode will pause execution and allow you to inspect variables and step through your code, just like you would with your main app.

### Check Device Logs

1. Open the Console app from the Applications/Utilities folder
2. Select your device from the Devices list
3. Filter the log messages by process name matching your share extension target name

### Check Crash Logs

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
- https://github.com/EvanBacon/pillar-valley/tree/master/targets/widgets
- https://github.com/andrew-levy/react-native-safari-extension
- https://github.com/bndkt/react-native-app-clip
