import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { copyText } from "../clipboard";
import { proposeTrade } from "../api/evaluate";
import {
  ActionButton,
  Card,
  InlineBanner,
  StatPill,
} from "../ui/primitives";
import { colors, radii, spacing, typography } from "../ui/theme";
import { useWindowWidth } from "../useWindowWidth";

function formatDelta(delta) {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

export function pitchText(trade) {
  return `Send ${trade.send} to ${trade.teamBName} for ${trade.receive}. Your delta ${trade.teamADelta}, their delta ${trade.teamBDelta}.`;
}

export default function Workshop({ trade, onClear, clearLabel, leagueId, onReload }) {
  const compact = useWindowWidth() < 520;
  const [writeError, setWriteError] = useState("");

  function onCopy() {
    copyText(pitchText(trade)).catch(() => {});
  }

  function onPropose() {
    const sendIds = String(trade.sendId).split("+").filter(Boolean);
    const receiveIds = String(trade.receiveId).split("+").filter(Boolean);
    proposeTrade(leagueId, sendIds, receiveIds)
      .then(() => {
        onReload?.();
      })
      .catch((err) => {
        setWriteError(err.body?.error || err.message || "ESPN reject");
      });
  }

  return (
    <Card style={styles.workshop} elevated>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Trade workshop</Text>
          <Text style={styles.workshopTitle}>Workshop</Text>
          <Text style={styles.counterpart}>{trade.teamBName}</Text>
        </View>
        <StatPill
          label={trade.mutual ? "Mutual" : "Not mutual"}
          tone={trade.mutual ? "positive" : "warning"}
        />
      </View>

      <View style={[styles.tradeFlow, compact && styles.tradeFlowCompact]}>
        <View testID="workshop-send" style={styles.tradeSide}>
          <Text style={styles.sideLabel}>You send</Text>
          <Text numberOfLines={2} style={styles.playerName}>
            {trade.send}
          </Text>
        </View>
        <View style={[styles.swapMark, compact && styles.swapMarkCompact]}>
          <Text style={styles.swapText}>⇄</Text>
        </View>
        <View testID="workshop-receive" style={styles.tradeSide}>
          <Text style={styles.sideLabel}>You receive</Text>
          <Text numberOfLines={2} style={styles.playerName}>
            {trade.receive}
          </Text>
        </View>
      </View>

      <View testID="workshop-impact" style={styles.impact}>
        <View style={styles.impactHeader}>
          <Text style={styles.impactTitle}>Projected impact</Text>
          <View style={styles.deltaPair}>
            <StatPill
              label={formatDelta(trade.teamADelta)}
              tone={trade.teamADelta >= 0 ? "positive" : "negative"}
            />
            <StatPill
              label={formatDelta(trade.teamBDelta)}
              tone={trade.teamBDelta >= 0 ? "positive" : "negative"}
            />
          </View>
        </View>
        <View style={[styles.impactGrid, compact && styles.impactGridCompact]}>
          <View style={styles.impactTeam}>
            <Text style={styles.impactLabel}>Your outlook</Text>
            <View style={styles.statLine}>
              <View>
                <Text style={styles.statLabel}>Before</Text>
                <Text style={styles.statValue}>{trade.beforeA}</Text>
              </View>
              <Text style={styles.statArrow}>→</Text>
              <View style={styles.statAfter}>
                <Text style={styles.statLabel}>After</Text>
                <Text
                  style={[
                    styles.statValue,
                    trade.teamADelta >= 0 ? styles.positive : styles.negative,
                  ]}
                >
                  {trade.afterA}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={[
              styles.impactDivider,
              compact && styles.impactDividerCompact,
            ]}
          />
          <View style={styles.impactTeam}>
            <Text style={styles.impactLabel}>{trade.teamBName} outlook</Text>
            <View style={styles.statLine}>
              <View>
                <Text style={styles.statLabel}>Before</Text>
                <Text style={styles.statValue}>{trade.beforeB}</Text>
              </View>
              <Text style={styles.statArrow}>→</Text>
              <View style={styles.statAfter}>
                <Text style={styles.statLabel}>After</Text>
                <Text
                  style={[
                    styles.statValue,
                    trade.teamBDelta >= 0 ? styles.positive : styles.negative,
                  ]}
                >
                  {trade.afterB}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {writeError ? (
        <InlineBanner
          tone="danger"
          title="ESPN rejected the proposal"
          message={writeError}
        />
      ) : null}
      <View testID="workshop-actions" style={styles.actions}>
        {leagueId ? (
          <ActionButton
            label="Propose on ESPN"
            onPress={onPropose}
            style={styles.primaryAction}
          />
        ) : null}
        <ActionButton
          label="Copy pitch"
          onPress={onCopy}
          variant="secondary"
          style={styles.action}
        />
        <ActionButton
          label={clearLabel}
          onPress={onClear}
          variant="ghost"
          style={styles.action}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  workshop: {
    gap: spacing.lg,
    borderColor: colors.accent,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    ...typography.sectionLabel,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  workshopTitle: {
    ...typography.title,
    color: colors.text,
  },
  counterpart: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 2,
  },
  tradeFlow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.sm,
  },
  tradeFlowCompact: {
    flexDirection: "column",
  },
  tradeSide: {
    flex: 1,
    minWidth: 0,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.canvasMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sideLabel: {
    ...typography.sectionLabel,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  playerName: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  swapMark: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  swapMarkCompact: {
    width: "100%",
    height: 24,
  },
  swapText: {
    color: colors.info,
    fontSize: 21,
    fontWeight: "800",
  },
  impact: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.canvasMuted,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  impactHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  impactTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  deltaPair: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  impactGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  impactGridCompact: {
    flexDirection: "column",
  },
  impactTeam: {
    flex: 1,
    minWidth: 0,
  },
  impactDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  impactDividerCompact: {
    width: "100%",
    height: 1,
  },
  impactLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  statLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statValue: {
    ...typography.stat,
    color: colors.text,
    marginTop: 2,
  },
  statArrow: {
    color: colors.borderStrong,
    fontSize: 17,
  },
  statAfter: {
    alignItems: "flex-end",
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.danger,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  primaryAction: {
    flexGrow: 2,
  },
  action: {
    flexGrow: 1,
  },
});
