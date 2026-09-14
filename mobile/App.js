import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import LeagueSwitcher from "./src/screens/LeagueSwitcher";
import TradeDashboard from "./src/screens/TradeDashboard";

const LEAGUES = [
  { id: "111", name: "League A" },
  { id: "222", name: "League B" },
];

export default function App() {
  const [leagueId, setLeagueId] = useState(LEAGUES[0].id);

  return (
    <View style={styles.container}>
      <LeagueSwitcher leagues={LEAGUES} onSelect={setLeagueId} />
      <TradeDashboard leagueId={leagueId} />
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
