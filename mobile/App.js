import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import SettingsScreen from "./src/screens/SettingsScreen";

export default function App() {
  return (
    <View style={styles.container}>
      <SettingsScreen />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
