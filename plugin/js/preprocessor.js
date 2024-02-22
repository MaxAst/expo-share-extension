/* eslint-disable no-var */
/* eslint-disable object-shorthand */
var ShareExtensionPreprocessor = function () {};

ShareExtensionPreprocessor.prototype = {
  run: function (args) {
    try {
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      const jsonLd = Array.from(scripts).map((script) => script.innerHTML);

      args.completionFunction({
        url: window.location.href,
        jsonLd,
      });
    } catch (error) {
      args.completionFunction({
        error: error,
      });
    }
  },
};

// The JavaScript file must contain a global object named "ExtensionPreprocessingJS".
// eslint-disable-next-line no-unused-vars
var ExtensionPreprocessingJS = new ShareExtensionPreprocessor();
