import { type ComponentType, forwardRef } from "react";
import type { TextProps } from "react-native";
// @ts-ignore
import { NativeText } from "react-native/Libraries/Text/TextNativeComponent";

const Text = forwardRef((props, ref) => {
  return <NativeText {...props} ref={ref} allowFontScaling={false} />;
}) as ComponentType<TextProps>;

Text.displayName = "RCTText";

export { Text };
