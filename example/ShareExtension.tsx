import * as ExpoShareExtension from "expo-share-extension";
import { Button, StyleSheet, Text, View } from "react-native";

export default function ShareExtension() {
  return (
    <View style={styles.container}>
      <Text style={{ color: "#313639" }}>{ExpoShareExtension.hello()}</Text>
      <Button
        title="Add from share extension"
        onPress={() => {
          console.log("pressed from share extension");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
    alignItems: "center",
    justifyContent: "center",
  },
});
