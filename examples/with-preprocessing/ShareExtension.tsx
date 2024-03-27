import { type InitialProps, close } from "expo-share-extension";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { z } from "zod";

const preprocessingResultsSchema = z.object({
  title: z.string(),
});

export default function ShareExtension({
  preprocessingResults,
  text,
}: InitialProps) {
  const [title, setTitle] = useState<string>();

  useEffect(() => {
    const result = preprocessingResultsSchema.safeParse(preprocessingResults);
    if (result.success) {
      setTitle(result.data.title);
    }
  }, [preprocessingResults]);

  return (
    <View style={styles.container}>
      <Text
        style={{ fontFamily: "Inter-Black", fontSize: 24, marginBottom: 10 }}
      >
        Preprocessing Example
      </Text>
      {title && (
        <Text
          style={{
            textAlign: "center",
            color: "#313639",
            fontSize: 16,
          }}
        >
          Document title: {title}
        </Text>
      )}
      {text && (
        <Text
          style={{
            textAlign: "center",
            color: "#313639",
            fontSize: 16,
          }}
        >
          Text: {text}
        </Text>
      )}
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
