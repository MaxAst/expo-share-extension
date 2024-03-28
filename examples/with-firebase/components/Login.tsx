import * as AppleAuthentication from "expo-apple-authentication";
import { Pressable, Text, View } from "react-native";

import { signInWithApple, signInWithGoogle } from "../lib/auth";

export const Login = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 10 }}>
      <Pressable
        onPress={signInWithGoogle}
        style={{
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "lightblue",
          width: "80%",
          height: 50,
          borderRadius: 10,
          borderColor: "lightblue",
          borderWidth: 1,
          shadowColor: "lightblue",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
        }}
      >
        <Text style={{ fontSize: 18 }}>Sign In with Google</Text>
      </Pressable>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={10}
        onPress={signInWithApple}
        style={{ height: 50, width: "80%" }}
      />
    </View>
  );
};
