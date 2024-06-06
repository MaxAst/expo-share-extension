import * as FileSystem from "expo-file-system";
import { useLocalSearchParams } from "expo-router";
import { clearAppGroupContainer } from "expo-share-extension";
import { useCallback, useEffect } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Create() {
  const { videoUrl } = useLocalSearchParams();

  const checkSharedDataDirectory = useCallback(async () => {
    if (!videoUrl || typeof videoUrl !== "string") return;
    const regex = /(.*\/AppGroup\/)/;
    const match = videoUrl.match(regex);

    const appGroupPath = match ? match[1] : null;

    if (!appGroupPath) {
      throw new Error(
        "Failed to parse AppGroup path from iOS share extension video url"
      );
    }

    try {
      const files = await FileSystem.readDirectoryAsync(appGroupPath);
      console.log(
        "Includes sharedData directory?",
        files.includes("sharedData")
      );
      if (files.includes("sharedData")) {
        const sharedDataFiles = await FileSystem.readDirectoryAsync(
          `${appGroupPath}sharedData`
        );
        console.log(sharedDataFiles);
      }
    } catch (error) {
      console.error(error);
    }
  }, [videoUrl]);

  useEffect(() => {
    checkSharedDataDirectory();
  }, [videoUrl]);

  const handleClearAppGroupContainer = async () => {
    try {
      await clearAppGroupContainer();
    } catch (error) {
      console.error(error);
    }

    await checkSharedDataDirectory();
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
