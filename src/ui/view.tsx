import { type ComponentType, forwardRef } from "react";
import type { ViewProps } from "react-native";
// @ts-ignore
import NativeView from "react-native/Libraries/Components/View/ViewNativeComponent";

const View = forwardRef((props, ref) => {
  return <NativeView {...props} ref={ref} />;
}) as ComponentType<ViewProps>;

View.displayName = "RCTView";

export { View };
