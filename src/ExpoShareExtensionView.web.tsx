import * as React from 'react';

import { ExpoShareExtensionViewProps } from './ExpoShareExtension.types';

export default function ExpoShareExtensionView(props: ExpoShareExtensionViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
