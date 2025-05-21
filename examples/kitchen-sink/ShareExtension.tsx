import {
  Text,
  View,
  PixelRatio,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
// Assuming InitialProps is correctly defined in your project if you use it for props typing
// For this minimal test, we'll just use a generic props type if InitialProps isn't vital here.
// import { type InitialProps } from "expo-share-extension";

interface MinimalProps {
  url?: string;
  text?: string;
  fontScale?: number;
  pixelRatio?: number;
  initialViewWidth?: number;
  initialViewHeight?: number;
}

export default function ShareExtension(props: MinimalProps) {
  const { fontScale: jsFontScaleFromHook, scale: jsScaleFromHook } =
    useWindowDimensions();
  const nativeFontScale = props.fontScale; // from initialProps
  const nativePixelRatio = props.pixelRatio; // from initialProps

  console.log(`[ShareExtension.tsx] Component Rendered`);
  console.log(
    `  useWindowDimensions(): fontScale=${jsFontScaleFromHook}, scale=${jsScaleFromHook}`
  );
  console.log(
    `  initialProps: fontScale=${nativeFontScale}, pixelRatio=${nativePixelRatio}`
  );
  console.log(`  PixelRatio.getFontScale(): ${PixelRatio.getFontScale()}`);
  console.log(`  PixelRatio.get(): ${PixelRatio.get()}`);

  const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "lightyellow",
      padding: 20,
    },
    textStyle: { marginBottom: 10, textAlign: "center" },
  });

  return (
    <View style={styles.wrapper}>
      <Text
        style={[
          styles.textStyle,
          { fontSize: 20, color: "black", fontWeight: "bold" },
        ]}
      >
        Test: Base Size 20pt
      </Text>
      <Text
        style={[
          styles.textStyle,
          { fontSize: 20 * PixelRatio.getFontScale(), color: "blue" },
        ]}
      >
        Test: JS Scaled (20pt * PixelRatio.getFontScale() ={" "}
        {20 * PixelRatio.getFontScale()}pt)
      </Text>
      <Text
        style={[
          styles.textStyle,
          { fontSize: 20 * (nativeFontScale || 1), color: "green" },
        ]}
      >
        Test: Native Prop Scaled (20pt * nativeFontScale ={" "}
        {20 * (nativeFontScale || 1)}pt)
      </Text>
      <Text style={[styles.textStyle, { fontSize: 12, color: "grey" }]}>
        (Device Scale from useWindowDimensions: {jsScaleFromHook}x, from Prop:{" "}
        {nativePixelRatio}x)
      </Text>
      {props.url && (
        <Text style={[styles.textStyle, { fontSize: 14 }]}>
          URL: {props.url}
        </Text>
      )}
    </View>
  );
}
