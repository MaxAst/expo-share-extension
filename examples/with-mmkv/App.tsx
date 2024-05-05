import { useCallback } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";
import { useMMKVString } from "react-native-mmkv";

import { storage } from "./storage";

export default function App() {
  const [shared] = useMMKVString("shared");

  const enterText = useCallback(() => {
    Alert.prompt(
      "Enter persisted value",
      "This value will be stored in MMKV",
      (text) => {
        storage.set("shared", text);
      },
    );
  }, []);

  return (
    <View style={styles.container}>
      <Text
        style={{ fontFamily: "Inter-Black", fontSize: 24, marginBottom: 10 }}
      >
        With MMKV Example
      </Text>
      <Text
        style={{
          textAlign: "center",
          color: "#313639",
          fontSize: 16,
        }}
      >
        Persisted value: {shared}
      </Text>
      <Button title="Enter persisted value" onPress={enterText} />
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
