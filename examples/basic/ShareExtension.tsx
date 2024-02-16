import { close } from "expo-share-extension"
import { Button, Text, View } from "react-native";

export default function ShareExtension({ url }: { url: string }) {
  return (
    <View
      style={{
        backgroundColor: "transparent",
        flex: 1,
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 30 }}>{url}</Text>
      <Button title="Close" onPress={close} />
    </View>
  );
}
