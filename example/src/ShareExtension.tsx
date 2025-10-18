import { close, type InitialProps, Text, View } from "expo-share-extension";
import { useEffect } from "react";
import { Button, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";

export default function ShareExtension({ url, text }: InitialProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Animate in when component mounts
    opacity.value = withSpring(1, { damping: 20, stiffness: 90 });
    scale.value = withSpring(1, { damping: 20, stiffness: 90 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.contentContainer, animatedStyle]}>
        <Text
          style={{ fontFamily: "Inter-Black", fontSize: 24, marginBottom: 10 }}
        >
          Basic Example
        </Text>
        {url && (
          <Text
            style={{
              textAlign: "center",
              color: "#313639",
              fontSize: 16,
            }}
          >
            URL: {url}
          </Text>
        )}
        {text && (
          <Text
            style={{
              textAlign: "center",
              color: "#313639",
              fontSize: 16,
            }}
          >
            Text: {text}
          </Text>
        )}
        <Button title="Close" onPress={close} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#FAF8F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
