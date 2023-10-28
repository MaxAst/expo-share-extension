import React from "react";
import { AppRegistry, View, Text } from "react-native";

// Your Share Extension's main component
const ShareExtension = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Hello from Share Extension!</Text>
    </View>
  );
};

// Register the Share Extension's main component
AppRegistry.registerComponent("ShareExtensionApp", () => ShareExtension);
