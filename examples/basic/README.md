# Basic Example

This example demonstrates the `backgroundColor` and `height` options that you can provide in app.json to customize the look of the native view. It'd be configured in app.json like so:

```json
[
  "expo-share-extension",
  {
    "backgroundColor": {
      "red": 255,
      "green": 255,
      "blue": 255,
      "alpha": 0 // make the background transparent
    },
    "height": 500
  }
]
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
