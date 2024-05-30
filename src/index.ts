import ExpoShareExtensionModule from "./ExpoShareExtensionModule";

export function close(): void {
  return ExpoShareExtensionModule.close();
}

export function redirect(path: string): void {
  return ExpoShareExtensionModule.redirect(path);
}

export interface IExtensionPreprocessingJS {
  run: (args: { completionFunction: (data: unknown) => void }) => void;
  finalize: (args: unknown) => void;
}

export type InitialProps = {
  images?: string[];
  videos?: string[];
  text?: string;
  url?: string;
  preprocessingResults?: unknown;
};
