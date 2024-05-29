# Media Example

This example demonstrates how to share media. It'd be configured in app.json like so:

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

Once you set this option, `expo-share-extension` will add [`NSExtensionActivationSupportsWebPageWithMaxCount: 1`](https://developer.apple.com/documentation/bundleresources/information_property_list/nsextension/nsextensionattributes/nsextensionactivationrule/nsextensionactivationsupportswebpagewithmaxcount) as an `NSExtensionActivationRule`. Your preprocessing file must adhere to some rules:

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

See the [preprocessing.js](./preprocessing.js) file for a complete example.

**WARNING:** Using this option enbales [`NSExtensionActivationSupportsWebPageWithMaxCount: 1`](https://developer.apple.com/documentation/bundleresources/information_property_list/nsextension/nsextensionattributes/nsextensionactivationrule/nsextensionactivationsupportswebpagewithmaxcount) and this is mutually exclusive with [`NSExtensionActivationSupportsWebURLWithMaxCount: 1`](https://developer.apple.com/documentation/bundleresources/information_property_list/nsextension/nsextensionattributes/nsextensionactivationrule/nsextensionactivationsupportsweburlwithmaxcount), which `expo-share-extension` enables by default. This means that once you set the `preprocessingFile` option, you will no longer receive `url` as part of initial props. However, you can still get the URL by using `window.location.href` in your preprocessing file:

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
