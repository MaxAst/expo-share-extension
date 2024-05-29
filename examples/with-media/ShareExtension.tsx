import * as Linking from "expo-linking";
import { type InitialProps, close } from "expo-share-extension";
import { useCallback } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function ShareExtension({ images, videos }: InitialProps) {
  // TODO: Figure out how to redirect to host app
  const openHostApp = useCallback(() => {
    try {
      Linking.canOpenURL("withmedia://create").then((supported) => {
        if (supported) {
          Linking.openURL("withmedia://create");
        } else {
          console.log("Don't know how to open URI: withmedia://create");
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  console.log(JSON.stringify(videos));

  return (
    <View style={styles.container}>
      <Text
        style={{ fontFamily: "Inter-Black", fontSize: 24, marginBottom: 10 }}
      >
        Media Example
      </Text>
      {images?.length ? (
        <Text
          style={{
            textAlign: "center",
            color: "#313639",
            fontSize: 16,
          }}
        >
          Images: {JSON.stringify(images)}
        </Text>
      ) : null}
      {videos?.length ? (
        <Text
          style={{
            textAlign: "center",
            color: "#313639",
            fontSize: 16,
          }}
        >
          Videos:{JSON.stringify(videos)}
        </Text>
      ) : null}
      <Button title="Open Host App" onPress={openHostApp} />
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
