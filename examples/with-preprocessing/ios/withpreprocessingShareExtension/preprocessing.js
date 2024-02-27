class ShareExtensionPreprocessor {
  run(args) {
    args.completionFunction({
      title: document.title,
    });
  }
}

var ExtensionPreprocessingJS = new ShareExtensionPreprocessor();
