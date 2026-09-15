import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { fetchLeagues } from "./src/api/leagues";
import { isDesktopWidth } from "./src/layout";
import LeagueBoard from "./src/screens/LeagueBoard";
import LeagueSwitcher from "./src/screens/LeagueSwitcher";
import SettingsScreen from "./src/screens/SettingsScreen";
import TradeDashboard from "./src/screens/TradeDashboard";
import { useWindowWidth } from "./src/useWindowWidth";

export default function App() {
  const width = useWindowWidth();
  const desktop = isDesktopWidth(width);
  const [leagues, setLeagues] = useState([]);
  const [leagueId, setLeagueId] = useState(null);

  function loadLeagues() {
    return fetchLeagues()
      .then((data) => {
        const next = data.leagues || [];
        // #region agent log
        fetch("http://127.0.0.1:7257/ingest/09ed06f5-2a1a-412c-960f-6f6e174b9c44", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "1de000",
          },
          body: JSON.stringify({
            sessionId: "1de000",
            hypothesisId: "D",
            location: "App.js:loadLeagues",
            message: "leagues loaded",
            data: { count: next.length, ids: next.map((row) => row.id) },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        setLeagues(next);
        setLeagueId((current) => {
          if (current && next.some((league) => league.id === current)) {
            return current;
          }
          return next[0] ? next[0].id : null;
        });
      })
      .catch((err) => {
        // #region agent log
        fetch("http://127.0.0.1:7257/ingest/09ed06f5-2a1a-412c-960f-6f6e174b9c44", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "1de000",
          },
          body: JSON.stringify({
            sessionId: "1de000",
            hypothesisId: "D",
            location: "App.js:loadLeagues.catch",
            message: "fetchLeagues rejected",
            data: { text: String(err) },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      });
  }

  useEffect(() => {
    loadLeagues();
  }, []);

  return (
    <ScrollView
      testID="app-scroll"
      style={styles.page}
      contentContainerStyle={styles.inner}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Roster Pulse</Text>
      <Text style={styles.subtitle}>
        League intel and mutually beneficial 1-for-1 trades from your ESPN roster.
      </Text>
      <View
        testID="app-layout"
        style={[styles.layout, desktop ? styles.layoutWide : styles.layoutNarrow]}
      >
        <View style={desktop ? styles.sidebar : styles.stackSection}>
          <SettingsScreen onSaved={loadLeagues} savedLeagues={leagues} />
        </View>
        <View style={desktop ? styles.main : styles.stackSection}>
          <LeagueSwitcher
            leagues={leagues}
            selectedId={leagueId}
            onSelect={setLeagueId}
          />
          <LeagueBoard leagueId={leagueId} />
          <TradeDashboard leagueId={leagueId} />
        </View>
      </View>
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f4f4f5",
  },
  inner: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#52525b",
    marginBottom: 16,
  },
  layout: {
    gap: 16,
  },
  layoutWide: {
    flexDirection: "row",
  },
  layoutNarrow: {
    flexDirection: "column",
  },
  sidebar: {
    width: 360,
    flexShrink: 0,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  stackSection: {
    width: "100%",
  },
});
