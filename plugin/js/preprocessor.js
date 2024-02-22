/* eslint-disable no-var */
/* eslint-disable object-shorthand */
var ShareExtensionPreprocessor = function () {};

ShareExtensionPreprocessor.prototype = {
  run: function (args) {
    try {
      var scripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      var jsonLd = Array.prototype.map.call(scripts, function (script) {
        return script.innerHTML;
      });

      var images = document.querySelectorAll("img");
      var firstRelevantImage;
      var imageURLs = [];

      // Find the first relevant image (assuming it's above the fold)
      Array.prototype.some.call(images, function (img) {
        if (
          img.naturalWidth > 100 &&
          img.naturalHeight > 100 &&
          img.getBoundingClientRect().top < window.innerHeight
        ) {
          firstRelevantImage = img;
          return true; // Stop the loop once the first relevant image is found
        }
      });

      if (firstRelevantImage) {
        var firstImageAspect =
          firstRelevantImage.naturalWidth / firstRelevantImage.naturalHeight;

        // Find other images with similar characteristics
        Array.prototype.forEach.call(images, function (img) {
          var imgAspect = img.naturalWidth / img.naturalHeight;
          // Consider images as similar based on aspect ratio and size
          if (
            Math.abs(imgAspect - firstImageAspect) < 0.1 &&
            img.naturalWidth > 100 &&
            img.naturalHeight > 100
          ) {
            imageURLs.push(img.src);
          }
        });
      }

      // Return results via the completion function
      args.completionFunction({
        url: window.location.href,
        jsonLd: jsonLd,
        images: imageURLs,
      });
    } catch (error) {
      args.completionFunction({
        error: error.toString(),
      });
    }
  },
};

// The JavaScript file must contain a global object named "ExtensionPreprocessingJS".
// eslint-disable-next-line no-unused-vars
var ExtensionPreprocessingJS = new ShareExtensionPreprocessor();
