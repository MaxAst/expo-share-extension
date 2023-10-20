import { StyleSheet, Text, View } from 'react-native';

import * as ExpoShareExtension from 'expo-share-extension';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{ExpoShareExtension.hello()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
