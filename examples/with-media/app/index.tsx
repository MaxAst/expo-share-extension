import dayjs from "dayjs";
import { clearAppGroupContainer } from "expo-share-extension";
import { StyleSheet, Text, View } from "react-native";

const cleanUpBefore = dayjs().subtract(1, "day").toDate();

clearAppGroupContainer(cleanUpBefore).catch((error) => {
  console.error(error);
});

export default function Index() {
  return (
    <View style={styles.container}>
      <Text
        style={{ fontFamily: "Inter-Black", fontSize: 24, marginBottom: 10 }}
      >
        Media Example
      </Text>
      <Text
        style={{
          textAlign: "center",
          color: "#313639",
          fontSize: 16,
        }}
      >
        Go to Photo Library and open the share menu on a photo to trigger this
        app's share extension.
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
