# File Example

This example demonstrates how to share files. It'd be configured in app.json like so:

```json
[
  "expo-share-extension",
  {
    "activationRules": [
      {
        "type": "file",
        "max": 2
      }
    ]
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
