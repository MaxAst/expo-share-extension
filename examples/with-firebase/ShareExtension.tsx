import auth, { type FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import { Alert, Button, Text, View, StyleSheet } from "react-native";

import { AppleAuthLoginButton } from "./components/AppleAuthLogin";

export default function ShareExtension({ url }: { url: string }) {
  const [session, setSession] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    auth()
      .useUserAccessGroup("group.expo.modules.shareextension.withfirebase")
      .then(() => {
        console.log("set up user access group on share extension");
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      console.log("I ran on share extension");
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
      {url && <Text style={{ fontSize: 30 }}>{url}</Text>}
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
