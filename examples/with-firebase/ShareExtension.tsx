import auth, { type FirebaseAuthTypes } from "@react-native-firebase/auth";
import { type InitialProps, close } from "expo-share-extension";
import { useEffect, useState } from "react";
import { Alert, Button, Text, View, StyleSheet } from "react-native";

import { Login } from "./components/Login";

export default function ShareExtension({ url, text }: InitialProps) {
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
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "Inter-Black",
            fontSize: 24,
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          Firebase Example
        </Text>
        {url && (
          <Text
            style={{
              textAlign: "center",
              color: "#313639",
              fontSize: 16,
            }}
          >
            URL: {url}
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
      <View style={{ flex: 1, paddingTop: 30 }}>
        {session ? (
          <View>
            <Text
              style={{
                textAlign: "center",
                color: "#313639",
                fontSize: 16,
              }}
            >
              Firebase User ID: {session.uid}
            </Text>
            <Button
              title="Sign Out"
              onPress={() =>
                auth()
                  .signOut()
                  .catch((error) =>
                    Alert.alert("Authentication Error", error.message),
                  )
              }
            />
          </View>
        ) : (
          <Login />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#FAF8F5",
    padding: 30,
  },
});
