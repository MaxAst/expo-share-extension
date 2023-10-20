import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to ExpoShareExtension.web.ts
// and on native platforms to ExpoShareExtension.ts
import ExpoShareExtensionModule from './ExpoShareExtensionModule';
import ExpoShareExtensionView from './ExpoShareExtensionView';
import { ChangeEventPayload, ExpoShareExtensionViewProps } from './ExpoShareExtension.types';

// Get the native constant value.
export const PI = ExpoShareExtensionModule.PI;

export function hello(): string {
  return ExpoShareExtensionModule.hello();
}

export async function setValueAsync(value: string) {
  return await ExpoShareExtensionModule.setValueAsync(value);
}

const emitter = new EventEmitter(ExpoShareExtensionModule ?? NativeModulesProxy.ExpoShareExtension);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { ExpoShareExtensionView, ExpoShareExtensionViewProps, ChangeEventPayload };
