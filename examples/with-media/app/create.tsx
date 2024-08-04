import { useLocalSearchParams } from "expo-router";
import { clearAppGroupContainer } from "expo-share-extension";
import { useEffect } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Create() {
  const { videoUrl } = useLocalSearchParams();

  useEffect(() => {
    // use sth. like expo-video-metadata to process video file
    console.log(videoUrl)
  }, [videoUrl]);

  const handleClearAppGroupContainer = async () => {
    try {
      await clearAppGroupContainer();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text
        style={{ fontFamily: "Inter-Black", fontSize: 24, marginBottom: 10 }}
      >
        Create Media
      </Text>
      <Text
        style={{
          textAlign: "center",
          color: "#313639",
          fontSize: 16,
        }}
      >
        {videoUrl ? `Video URL: ${videoUrl}` : "No video url"}
      </Text>
      <Button
        title="Delete Data in App Group Container"
        onPress={handleClearAppGroupContainer}
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
    padding: 30,
  },
});
