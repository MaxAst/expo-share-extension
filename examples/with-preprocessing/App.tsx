import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text
        style={{ fontFamily: "Inter-Black", fontSize: 24, marginBottom: 10 }}
      >
        Preprocessing Example
      </Text>
      <Text
        style={{
          textAlign: "center",
          color: "#313639",
          fontSize: 16,
        }}
      >
        Go to Safari and open the share menu to trigger this app's share
        extension.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
});
