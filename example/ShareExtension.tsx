import { Text, View } from "react-native";

export default function ShareExtension({ url }: { url: string }) {
  return (
    <View
      style={{
        backgroundColor: "transparent",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 30 }}>{url}</Text>
      <Text style={{ fontSize: 20 }}>Platform Default</Text>
    </View>
  );
}
