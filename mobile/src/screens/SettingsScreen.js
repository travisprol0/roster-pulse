import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { saveEspnCredentials } from "../api/espnCredentials";
import { deleteLeague } from "../api/leagues";
import { ActionButton, Card, InlineBanner } from "../ui/primitives";
import { colors, radii, spacing, typography } from "../ui/theme";

function emptyLeague() {
  return { leagueId: "" };
}

function fromSaved(savedLeagues) {
  if (!savedLeagues.length) {
    return [emptyLeague()];
  }
  return savedLeagues.map((league) => ({
    leagueId: String(league.id),
  }));
}

export default function SettingsScreen({ onSaved, savedLeagues = [] }) {
  const [leagues, setLeagues] = useState(() => fromSaved(savedLeagues));
  const [expanded, setExpanded] = useState(savedLeagues.length === 0);
  const [syncError, setSyncError] = useState("");
  const [syncOk, setSyncOk] = useState("");
  const [season, setSeason] = useState("2026");
  const [busy, setBusy] = useState(false);

  function toggleExpanded() {
    setExpanded((current) => !current);
  }

  function updateLeague(index, field, value) {
    setLeagues((current) =>
      current.map((league, i) => (i === index ? { ...league, [field]: value } : league))
    );
  }

  function onRemove(index) {
    const row = leagues[index];
    const saved = savedLeagues.some((league) => String(league.id) === String(row.leagueId));
    const next = leagues.filter((_, i) => i !== index);
    const finish = () => {
      setLeagues(next.length ? next : [emptyLeague()]);
      if (saved) {
        onSaved?.();
      }
    };
    if (saved && row.leagueId) {
      deleteLeague(row.leagueId)
        .then(finish)
        .catch(() => setSyncError("Could not delete league"));
      return;
    }
    finish();
  }

  function onSubmit() {
    const seasonNum = Number(season);
    if (!Number.isInteger(seasonNum) || seasonNum < 2000 || seasonNum > 2100) {
      setSyncError("Invalid season");
      setSyncOk("");
      return;
    }
    const incomplete = leagues.some((row) => !(row.leagueId || "").trim());
    if (incomplete) {
      setSyncError("Each league needs an ID");
      setSyncOk("");
      return;
    }
    setBusy(true);
    saveEspnCredentials({ leagues, season: seasonNum })
      .then((body) => {
        const rows = body.leagues || [];
        const unauthorized = rows.filter((row) => row.status === "unauthorized");
        const okRows = rows.filter((row) => row.status === "ok");
        if (unauthorized.length && !okRows.length) {
          setSyncError("Could not sync: unauthorized");
          setSyncOk("");
          return;
        }
        if (unauthorized.length) {
          setSyncError("Could not sync: unauthorized");
        } else {
          setSyncError("");
        }
        setSyncOk(okRows.length ? "Synced" : "");
        if (okRows.length) {
          onSaved?.();
        }
      })
      .catch((err) => {
        setSyncOk("");
        setSyncError(err.body?.error || "Could not sync");
      })
      .finally(() => setBusy(false));
  }

  return (
    <Card style={styles.content} elevated>
      <Pressable
        testID="settings-toggle"
        accessibilityRole="button"
        accessibilityLabel="Leagues"
        accessibilityState={{ expanded }}
        onPress={toggleExpanded}
        style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
      >
        <View style={styles.toggleCopy}>
          <Text style={styles.eyebrow}>ESPN account</Text>
          <Text style={styles.header}>Leagues</Text>
          <Text style={styles.summary}>
            {savedLeagues.length
              ? `${savedLeagues.length} league${savedLeagues.length === 1 ? "" : "s"} connected`
              : "Connect a league to unlock your dashboard"}
          </Text>
        </View>
        <View style={[styles.chevron, expanded && styles.chevronExpanded]}>
          <Text style={styles.chevronText}>⌄</Text>
        </View>
      </Pressable>
      {syncError ? (
        <InlineBanner
          tone="danger"
          title="ESPN sync needs attention"
          message={syncError}
        />
      ) : null}
      {syncOk ? (
        <InlineBanner tone="success" title="League data updated" message={syncOk} />
      ) : null}
      {expanded ? (
        <View style={styles.form}>
          <View>
            <Text style={styles.label}>Season</Text>
            <TextInput
              accessibilityLabel="Season"
              placeholder="2026"
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.accent}
              value={season}
              onChangeText={setSeason}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
          <View style={styles.privacyNote}>
            <View style={styles.lockMark}>
              <Text style={styles.lockText}>••</Text>
            </View>
            <Text style={styles.hint}>
              ESPN cookies stay on the server. This form only needs league IDs.
            </Text>
          </View>
          {leagues.map((league, index) => (
            <View key={index} style={styles.block}>
              <View style={styles.blockHeader}>
                <View style={styles.leagueNumber}>
                  <Text style={styles.leagueNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.heading}>League {index + 1}</Text>
              </View>
              <Text style={styles.label}>League ID</Text>
              <TextInput
                accessibilityLabel={`League ${index + 1} ID`}
                placeholder={`League ID ${index + 1}`}
                placeholderTextColor={colors.textMuted}
                selectionColor={colors.accent}
                value={league.leagueId}
                onChangeText={(value) => updateLeague(index, "leagueId", value)}
                autoCapitalize="none"
                style={styles.input}
              />
              <ActionButton
                label="Remove league"
                variant="danger"
                onPress={() => onRemove(index)}
              />
            </View>
          ))}
          <View style={styles.actions}>
            <ActionButton
              label="Add league"
              variant="secondary"
              onPress={() => setLeagues((current) => [...current, emptyLeague()])}
              style={styles.action}
            />
            <ActionButton
              testID="settings-submit"
              label="Submit"
              busyLabel="Syncing"
              busy={busy}
              onPress={onSubmit}
              style={styles.action}
            />
          </View>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  toggle: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.72,
  },
  toggleCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    ...typography.sectionLabel,
    color: colors.info,
    marginBottom: spacing.xs,
  },
  header: {
    ...typography.title,
    color: colors.text,
  },
  summary: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  chevron: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "0deg" }],
  },
  chevronExpanded: {
    transform: [{ rotate: "180deg" }],
  },
  chevronText: {
    color: colors.textSecondary,
    fontSize: 22,
    lineHeight: 24,
    marginTop: -5,
  },
  form: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.infoSoft,
    borderWidth: 1,
    borderColor: colors.info,
  },
  lockMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  lockText: {
    color: colors.info,
    fontWeight: "900",
    letterSpacing: 1,
  },
  block: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.canvasMuted,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  leagueNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  leagueNumberText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: "900",
  },
  heading: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.body,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  action: {
    flexGrow: 1,
  },
});
