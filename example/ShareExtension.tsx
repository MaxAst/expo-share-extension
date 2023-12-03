import { Text, View } from "react-native";

export default function ShareExtension() {
  return (
    <View
      style={{
        backgroundColor: "transparent",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontFamily: "Inter-Black", fontSize: 30 }}>WTF</Text>
      <Text style={{ fontSize: 20 }}>Platform Default</Text>
    </View>
  );
}
