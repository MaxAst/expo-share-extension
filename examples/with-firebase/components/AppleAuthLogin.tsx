import auth from "@react-native-firebase/auth";
import * as AppleAuthentication from "expo-apple-authentication";

const signInWithApple = async () => {
  try {
    const { state, identityToken } = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const credential = auth.AppleAuthProvider.credential(
      identityToken,
      state || undefined
    );

    await auth().signInWithCredential(credential);
  } catch (error: any) {
    console.log(`${JSON.stringify(error, null, 2)}`);
    if (error.code === "ERR_CANCELED") {
      // handle that the user canceled the sign-in flow
    } else {
      // handle other errors
    }
  }
};

export const AppleAuthLoginButton = () => {
  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      onPress={signInWithApple}
      style={{ height: 44, width: 200 }}
    />
  );
};
