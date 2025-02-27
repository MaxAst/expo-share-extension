import { StyleSheet, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

export default function ShareExtension() {
  const animatedHeight = useSharedValue(300);
  return (
    <View style={styles.container}>
      <View
        style={{
          height: 300,
          backgroundColor: "green",
          width: 300,
        }}
      />
      <Text
        allowFontScaling={false}
        style={{
          fontSize: 32,
          marginBottom: 10,
        }}
      >
        Basic Example {animatedHeight.value}
      </Text>
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
});
