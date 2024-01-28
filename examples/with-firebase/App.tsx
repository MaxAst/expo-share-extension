import auth, { type FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

import { AppleAuthLoginButton } from "./components/AppleAuthLogin";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [session, setSession] = useState<FirebaseAuthTypes.User | null>(null);
  const [fontsLoaded, fontError] = useFonts({
    "Inter-Black": require("./assets/fonts/Inter-Black.otf"),
  });

  useEffect(() => {
    auth()
      .useUserAccessGroup("group.expo.modules.shareextension.withfirebase")
      .then(() => {
        console.log("set up user access group on main app");
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      console.log("I ran on main app");
      if (user) {
        try {
          setSession(user);
        } catch (error) {
          console.log(error);
        }
      } else {
        setSession(null);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [setSession]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View onLayout={onLayoutRootView} style={styles.container}>
      <Text style={{ color: "#313639", fontFamily: "Inter-Black" }}>
        Firebase Demo
      </Text>
      {session ? (
        <View>
          <Text style={{ color: "#313639", fontFamily: "Inter-Black" }}>
            Firebase User ID: {session.uid}
          </Text>
          <Button
            title="Sign Out"
            onPress={() =>
              auth()
                .signOut()
                .catch((error) =>
                  Alert.alert("Authentication Error", error.message)
                )
            }
          />
        </View>
      ) : (
        <AppleAuthLoginButton />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
    alignItems: "center",
    justifyContent: "center",
  },
});
