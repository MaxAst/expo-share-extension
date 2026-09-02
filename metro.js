const path = require("path");

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
      return withShareExtensionEntry(rewrittenUrl, config);
    }

    return rewrittenUrl;
  };

  return config;
};

// In development the share extension requests `.expo/.virtual-metro-entry`,
// which Expo CLI rewrites to the host app's entry from package.json "main"
// (e.g. `/index.bundle` or `/node_modules/expo-router/entry.bundle`). Swap only
// the pathname to `index.share` so the extension gets its own bundle regardless
// of "main", while keeping the query params Expo inferred (hermes, routerRoot).
const withShareExtensionEntry = (url, config) => {
  const isRelative = url.startsWith("/");
  const parsed = isRelative ? new URL(url, "https://expo.dev") : new URL(url);

  if (!parsed.pathname.endsWith(".bundle")) {
    return url;
  }

  // Same root Metro uses to resolve request paths (workspace root in monorepos).
  const serverRoot = config.server.unstable_serverRoot ?? config.projectRoot;
  const entry = path
    .relative(serverRoot, path.join(config.projectRoot, "index.share"))
    .split(path.sep)
    .join("/");

  parsed.pathname = `/${entry}.bundle`;

  return isRelative ? parsed.pathname + parsed.search : parsed.toString();
};

module.exports = {
  withShareExtension,
};
