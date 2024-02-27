import ExpoShareExtensionModule from "./ExpoShareExtensionModule";

export function close(): void {
  return ExpoShareExtensionModule.close();
}

export interface IExtensionPreprocessingJS {
  run: (args: { completionFunction: (data: unknown) => void }) => void;
  finalize: (args: unknown) => void;
}
