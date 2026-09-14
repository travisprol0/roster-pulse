import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import TradeDashboard from "./src/screens/TradeDashboard";

export default function App() {
  return (
    <View style={styles.container}>
      <TradeDashboard />
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
