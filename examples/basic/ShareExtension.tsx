import { StyleSheet, Text, View } from "react-native";

export default function ShareExtension() {
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
        Basic Example
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
