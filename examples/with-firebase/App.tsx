import auth, { type FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

import { AppleAuthLoginButton } from "./components/AppleAuthLogin";

export default function App() {
  const [session, setSession] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    auth()
      .useUserAccessGroup("group.expo.modules.shareextension.withfirebase")
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
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

  return (
    <View style={styles.container}>
      <Text
        style={{ fontFamily: "Inter-Black", fontSize: 24, marginBottom: 10 }}
      >
        Basic Example
      </Text>
      <Text
        style={{
          textAlign: "center",
          color: "#313639",
          fontSize: 16,
        }}
      >
        After logging in, go to Safari and open the share menu to trigger this
        app's share extension. You should see that you are still logged in,
        because we are using the useUserAccessGroup hook with our app group
        name.
      </Text>
      <View style={{ paddingTop: 30 }}>
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
