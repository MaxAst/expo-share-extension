# Firebase Example

This example demonstrates the use of [React Native Firebase](https://rnfirebase.io/). Given that share extensions are separate iOS targets, they have their own bundle IDs, so we need to create a _dedicated_ GoogleService-Info.plist in the Firebase console, just for the share extension target. The bundle ID of your share extension is your existing bundle ID with `.ShareExtension` as the suffix, e.g. `com.example.app.ShareExtension`.

```json
[
  "expo-share-extension",
    {
      "googleServicesFile": "./path-to-your-separate/GoogleService-Info.plist",
    },
],
```

## Usage

1. Run Prebuild

```bash
npm run prebuild
```

2. Start the app via Expo CLI

```bash
npm run ios
```

3. or only start the metro server and build via XCode

```bash
npm run start
```
