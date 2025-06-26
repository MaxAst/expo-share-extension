import { forwardRef } from "react";
import { TextInput as RNTextInput, type TextInputProps } from "react-native";

const TextInput = forwardRef<RNTextInput, TextInputProps>((props, ref) => {
  return <RNTextInput {...props} ref={ref} allowFontScaling={false} />;
});

export { TextInput };
