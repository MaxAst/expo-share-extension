import { close } from "expo-share-extension";
import { Button, StyleSheet, Text, View } from "react-native";

export default function ShareExtension({
  preprocessingResults,
}: {
  preprocessingResults: { title: string };
}) {
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
        Document title: {preprocessingResults.title}
      </Text>
      <Button title="Close" onPress={close} />
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
