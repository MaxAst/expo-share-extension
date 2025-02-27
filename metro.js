const withShareExtension = (config) => {
  if (!config.resolver) {
    throw new Error("config.resolver is not defined");
  }

  config.resolver.sourceExts = [
    ...(config.resolver?.sourceExts ?? []),
    "share.js",
  ];

  if (!config.server) {
    throw new Error("config.server is not defined");
  }

  const originalRewriteRequestUrl =
    config.server?.rewriteRequestUrl || ((url) => url);

  config.server.rewriteRequestUrl = (url) => {
    const isShareExtension = url.includes("shareExtension=true");
    const rewrittenUrl = originalRewriteRequestUrl(url);

    if (isShareExtension) {
      return rewrittenUrl.replace("index.bundle", "index.share.bundle");
    }

    return rewrittenUrl;
  };

  return config;
};

module.exports = {
  withShareExtension,
};
