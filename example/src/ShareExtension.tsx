import { File } from "expo-file-system";
import {
  clearAppGroupContainer,
  close,
  type InitialProps,
  Text,
  View,
} from "expo-share-extension";
import { useEffect, useMemo } from "react";
import { Button, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";

function processFiles(urls: string[]) {
  return urls
    .map((url) => {
      const file = new File(url);
      const info = file.info();
      return `Filename: ${file.name}; exists: ${info.exists}; size: ${info.size}`;
    })
    .join("\n");
}

export default function ShareExtension({ url, text, files }: InitialProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Animate in when component mounts
    opacity.value = withSpring(1, { damping: 20, stiffness: 90 });
    scale.value = withSpring(1, { damping: 20, stiffness: 90 });
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const onClose = async () => {
    await clearAppGroupContainer();
    close();
  };

  const filesInfo = useMemo(
    () => (files ? processFiles(files) : undefined),
    [files]
  );

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
        {filesInfo && (
          <Text
            style={{
              textAlign: "center",
              color: "#313639",
              fontSize: 16,
            }}
          >
            Files: {filesInfo}
          </Text>
        )}
        <Button title="Close" onPress={onClose} />
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
