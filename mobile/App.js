import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
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
import { colors, layout, radii, spacing, typography } from "./src/ui/theme";
import { InlineBanner } from "./src/ui/primitives";
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
    <View style={styles.safe}>
        <StatusBar style="light" />
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
            <View style={styles.hero}>
              <View style={styles.brandMark} accessibilityElementsHidden>
                <View style={styles.brandOrbit} />
                <View style={styles.brandPulse}>
                  <View style={[styles.pulseSegment, styles.pulseShort]} />
                  <View style={[styles.pulseSegment, styles.pulseTall]} />
                  <View style={[styles.pulseSegment, styles.pulseMedium]} />
                </View>
              </View>
              <View
                style={styles.heroCopy}
              >
                <Text style={styles.kicker}>Fantasy command center</Text>
                <Text style={styles.title}>Roster Pulse</Text>
                <Text style={styles.subtitle}>
                  League intel, waivers, and trades from your ESPN roster.
                </Text>
              </View>
              <View
                accessible
                accessibilityLiveRegion="polite"
                accessibilityLabel={
                  loadError
                    ? "API offline"
                    : leagues.length
                      ? `${leagues.length} active leagues`
                      : "Ready to connect a league"
                }
                style={[
                  styles.livePill,
                  loadError && styles.offlinePill,
                  !loadError && !leagues.length && styles.readyPill,
                ]}
              >
                <View
                  style={[
                    styles.liveDot,
                    loadError && styles.offlineDot,
                    !loadError && !leagues.length && styles.readyDot,
                  ]}
                />
                <Text
                  style={[
                    styles.liveText,
                    loadError && styles.offlineText,
                    !loadError && !leagues.length && styles.readyText,
                  ]}
                >
                  {loadError
                    ? "API offline"
                    : leagues.length
                      ? `${leagues.length} league${leagues.length === 1 ? "" : "s"} active`
                      : "Ready to connect"}
                </Text>
              </View>
            </View>
            {loadError ? (
              <InlineBanner
                tone="danger"
                title="Connection interrupted"
                message={loadError}
                actionLabel="Retry"
                onAction={loadLeagues}
              />
            ) : null}
            <View
              testID="app-layout"
              style={[
                styles.layout,
                desktop ? styles.layoutWide : styles.layoutNarrow,
              ]}
            >
              <View style={desktop ? styles.sidebar : styles.stackSection}>
                <SettingsScreen
                  key={
                    leagues.map((league) => String(league.id)).join(",") ||
                    "empty"
                  }
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
            <View style={styles.footer}>
              <Text style={styles.footerText}>League intelligence</Text>
              <Text style={styles.footerDot}>•</Text>
              <Text style={styles.footerText}>Built for game day decisions</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  flex: {
    flex: 1,
  },
  page: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  inner: {
    width: "100%",
    maxWidth: layout.maxWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  hero: {
    minHeight: 112,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.lg,
    overflow: "hidden",
  },
  brandMark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandOrbit: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  brandPulse: {
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  pulseSegment: {
    width: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  pulseShort: {
    height: 10,
  },
  pulseTall: {
    height: 28,
  },
  pulseMedium: {
    height: 17,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    ...typography.sectionLabel,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  livePill: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.success,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 0,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: "700",
  },
  offlinePill: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
  },
  offlineDot: {
    backgroundColor: colors.danger,
  },
  offlineText: {
    color: colors.danger,
  },
  readyPill: {
    backgroundColor: colors.infoSoft,
    borderColor: colors.info,
  },
  readyDot: {
    backgroundColor: colors.info,
  },
  readyText: {
    color: colors.info,
  },
  layout: {
    gap: spacing.lg,
  },
  layoutWide: {
    flexDirection: "row",
  },
  layoutNarrow: {
    flexDirection: "column",
  },
  sidebar: {
    width: layout.sidebarWidth,
    flexShrink: 0,
  },
  main: {
    flex: 1,
    minWidth: 0,
    gap: spacing.lg,
  },
  stackSection: {
    width: "100%",
    gap: spacing.lg,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  footerDot: {
    color: colors.borderStrong,
  },
});
