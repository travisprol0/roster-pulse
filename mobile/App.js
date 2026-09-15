import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
  const [reloadToken, setReloadToken] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [workshopOwner, setWorkshopOwner] = useState(null);

  function bump() {
    setReloadToken((current) => current + 1);
  }

  function loadLeagues() {
    return fetchLeagues()
      .then((data) => {
        const next = data.leagues || [];
        setLoadError("");
        setLeagues(next);
        setLeagueId((current) => {
          if (current && next.some((league) => league.id === current)) {
            return current;
          }
          return next[0] ? next[0].id : null;
        });
      })
      .catch(() => {
        setLoadError("Could not reach API");
      });
  }

  useEffect(() => {
    loadLeagues();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          testID="app-scroll"
          style={styles.page}
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Roster Pulse</Text>
          <Text style={styles.subtitle}>
            League intel, waivers, and trades from your ESPN roster.
          </Text>
          {loadError ? (
            <View>
              <Text>{loadError}</Text>
              <Pressable onPress={loadLeagues}>
                <Text>Retry</Text>
              </Pressable>
            </View>
          ) : null}
          <View
            testID="app-layout"
            style={[styles.layout, desktop ? styles.layoutWide : styles.layoutNarrow]}
          >
            <View style={desktop ? styles.sidebar : styles.stackSection}>
              <SettingsScreen
                key={leagues.map((league) => String(league.id)).join(",") || "empty"}
                onSaved={() => {
                  loadLeagues().then(bump);
                }}
                savedLeagues={leagues}
              />
            </View>
            <View style={desktop ? styles.main : styles.stackSection}>
              <LeagueSwitcher
                leagues={leagues}
                selectedId={leagueId}
                onSelect={setLeagueId}
              />
              <LeagueBoard
                leagueId={leagueId}
                reloadToken={reloadToken}
                onReload={bump}
                workshopOwner={workshopOwner}
                setWorkshopOwner={setWorkshopOwner}
              />
              <TradeDashboard
                leagueId={leagueId}
                reloadToken={reloadToken}
                onReload={bump}
                workshopOwner={workshopOwner}
                setWorkshopOwner={setWorkshopOwner}
              />
            </View>
          </View>
          <StatusBar style="auto" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f4f4f5",
  },
  flex: {
    flex: 1,
  },
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
