import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { ExpoShareExtensionViewProps } from './ExpoShareExtension.types';

const NativeView: React.ComponentType<ExpoShareExtensionViewProps> =
  requireNativeViewManager('ExpoShareExtension');

export default function ExpoShareExtensionView(props: ExpoShareExtensionViewProps) {
  return <NativeView {...props} />;
}
