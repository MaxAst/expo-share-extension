import { getDefaultConfig } from "expo/metro-config";

import ExpoShareExtensionModule from "./ExpoShareExtensionModule";

export function close(): void {
  return ExpoShareExtensionModule.close();
}

export function openHostApp(path: string): void {
  return ExpoShareExtensionModule.openHostApp(path);
}

export async function clearAppGroupContainer(args?: {
  cleanUpBefore?: Date;
}): Promise<void> {
  return await ExpoShareExtensionModule.clearAppGroupContainer(
    args?.cleanUpBefore?.toISOString(),
  );
}

export interface IExtensionPreprocessingJS {
  run: (args: { completionFunction: (data: unknown) => void }) => void;
  finalize: (args: unknown) => void;
}

export type InitialProps = {
  files?: string[];
  images?: string[];
  videos?: string[];
  text?: string;
  url?: string;
  preprocessingResults?: unknown;
};

export const withShareExtension = (
  config: ReturnType<typeof getDefaultConfig>,
) => {
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
