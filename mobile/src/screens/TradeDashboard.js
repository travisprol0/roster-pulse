import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { fetchTrades } from "../api/trades";
import { isDataTableWidth } from "../layout";
import {
  Card,
  Chip,
  EmptyState,
  InlineBanner,
  LoadingState,
  SectionHeader,
  StatPill,
} from "../ui/primitives";
import { colors, radii, spacing, typography } from "../ui/theme";
import { useWindowWidth } from "../useWindowWidth";
import Workshop from "./Workshop";

function formatDelta(delta) {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function Filters({
  opponentId,
  onOpponent,
  onPosition,
  position,
  trades,
}) {
  const opponents = [];
  const seen = new Set();
  for (const trade of trades) {
    if (seen.has(trade.teamBId)) {
      continue;
    }
    seen.add(trade.teamBId);
    opponents.push({ id: trade.teamBId, name: trade.teamBName });
  }
  return (
    <View style={styles.filterGroups}>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Opponent</Text>
        <View style={styles.filters}>
          <Chip
            testID="filter-opponent-all"
            label="All opponents"
            selected={opponentId === "all"}
            onPress={() => onOpponent("all")}
          />
          {opponents.map((opponent) => (
            <Chip
              key={String(opponent.id)}
              testID={`filter-opponent-${opponent.id}`}
              label={`vs ${opponent.name}`}
              selected={opponentId === opponent.id}
              onPress={() => onOpponent(opponent.id)}
            />
          ))}
        </View>
      </View>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Position</Text>
        <View style={styles.filters}>
          <Chip
            testID="filter-position-all"
            label="All positions"
            selected={position === "all"}
            onPress={() => onPosition("all")}
          />
          {["QB", "RB", "WR", "TE", "K", "DST"].map((pos) => (
            <Chip
              key={pos}
              testID={`filter-position-${pos}`}
              label={pos}
              selected={position === pos}
              onPress={() => onPosition(pos)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function Header() {
  return (
    <View style={[styles.row, styles.header]}>
      <Text style={[styles.cell, styles.headerText]}>You send</Text>
      <Text style={[styles.cell, styles.headerText]}>You receive</Text>
      <Text style={[styles.cell, styles.headerText]}>Them</Text>
      <Text style={[styles.cell, styles.headerText]}>Your delta</Text>
      <Text style={[styles.cell, styles.headerText]}>Their delta</Text>
    </View>
  );
}

function TradeCard({ item, onPress }) {
  return (
    <Pressable
      testID={`trade-card-${item.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Trade ${item.send} for ${item.receive} with ${item.teamBName}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tradeCard,
        pressed && styles.tradePressed,
      ]}
    >
      <View style={styles.tradeCardHeader}>
        <View>
          <Text style={styles.tradeCardEyebrow}>Them</Text>
          <Text style={styles.tradeOpponent}>{item.teamBName}</Text>
        </View>
        <View style={styles.tradeDeltaPair}>
          <StatPill
            label={
              item.teamADelta >= 0 && item.teamBDelta >= 0
                ? "Mutual upside"
                : "Review impact"
            }
            tone={
              item.teamADelta >= 0 && item.teamBDelta >= 0
                ? "positive"
                : "warning"
            }
          />
        </View>
      </View>
      <View style={styles.tradeFlow}>
        <View style={styles.tradeSide}>
          <Text style={styles.tradeSideLabel}>You send</Text>
          <Text style={styles.tradePlayer}>{item.send}</Text>
        </View>
        <Text style={styles.tradeArrow}>→</Text>
        <View style={styles.tradeSide}>
          <Text style={styles.tradeSideLabel}>You receive</Text>
          <Text style={styles.tradePlayer}>{item.receive}</Text>
        </View>
      </View>
      <View style={styles.tradeImpact}>
        <View style={styles.tradeImpactItem}>
          <Text style={styles.tradeImpactLabel}>Your delta</Text>
          <Text
            style={[
              styles.tradeImpactValue,
              item.teamADelta >= 0 ? styles.deltaPositive : styles.deltaNegative,
            ]}
          >
            {formatDelta(item.teamADelta)}
          </Text>
        </View>
        <View style={styles.tradeImpactDivider} />
        <View style={styles.tradeImpactItem}>
          <Text style={styles.tradeImpactLabel}>Their delta</Text>
          <Text
            style={[
              styles.tradeImpactValue,
              item.teamBDelta >= 0 ? styles.deltaPositive : styles.deltaNegative,
            ]}
          >
            {formatDelta(item.teamBDelta)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function TradeDashboard({
  leagueId,
  reloadToken = 0,
  onReload,
  workshopOwner,
  setWorkshopOwner,
}) {
  const width = useWindowWidth();
  const desktop = isDataTableWidth(width);
  const [loading, setLoading] = useState(Boolean(leagueId));
  const [trades, setTrades] = useState([]);
  const [selected, setSelected] = useState(null);
  const [opponentId, setOpponentId] = useState("all");
  const [position, setPosition] = useState("all");
  const [sort, setSort] = useState("fair");
  const [mode, setMode] = useState("1for1");
  const [error, setError] = useState("");
  const seq = useRef(0);

  useEffect(() => {
    if (!leagueId) {
      setLoading(false);
      setTrades([]);
      setSelected(null);
      setOpponentId("all");
      setPosition("all");
      setSort("fair");
      setMode("1for1");
      setError("");
      return;
    }
    const token = seq.current + 1;
    seq.current = token;
    setLoading(true);
    const request =
      mode === "2for1" ? fetchTrades(leagueId, "2for1") : fetchTrades(leagueId);
    request
      .then((data) => {
        if (seq.current !== token) {
          return;
        }
        setTrades(data.trades || []);
        setError(data.error || "");
        setSelected(null);
        setOpponentId("all");
        setPosition("all");
        setSort("fair");
        setLoading(false);
      })
      .catch(() => {
        if (seq.current !== token) {
          return;
        }
        setTrades([]);
        setSelected(null);
        setOpponentId("all");
        setPosition("all");
        setSort("fair");
        setError("Could not load trades");
        setLoading(false);
      });
  }, [leagueId, mode, reloadToken]);

  if (loading) {
    return <LoadingState testID="loading" label="Finding trade ideas" />;
  }

  if (!leagueId) {
    return (
      <EmptyState
        title="Add a league in settings, then pick it here."
        description="Trade recommendations will appear once a league is active."
      />
    );
  }

  const visible = trades.filter((item) => {
    if (opponentId !== "all" && item.teamBId !== opponentId) {
      return false;
    }
    if (position !== "all") {
      return item.sendPosition === position || item.receivePosition === position;
    }
    return true;
  });
  visible.sort((a, b) => {
    if (sort === "you") {
      return b.teamADelta - a.teamADelta;
    }
    if (sort === "vorp") {
      return (b.teamADelta || 0) - (a.teamADelta || 0);
    }
    return (
      Math.min(b.teamADelta, b.teamBDelta) - Math.min(a.teamADelta, a.teamBDelta)
    );
  });

  const showWorkshop = selected && workshopOwner !== "board";
  const emptyCopy = error
    ? ""
    : trades.length === 0
      ? "No mutually beneficial trades."
      : visible.length === 0
        ? "No trades match filters."
        : "";

  return (
    <View style={styles.dashboard}>
      <SectionHeader
        eyebrow="Deal finder"
        title="Trade ideas"
        subtitle="Explore mutually useful swaps, then take the best pitch to ESPN."
      />
      <Card style={styles.controls}>
        <View style={styles.controlTop}>
          <View style={styles.controlGroup}>
            <Text style={styles.filterLabel}>Package</Text>
            <View style={styles.filters}>
              <Chip
                testID="mode-1for1"
                label="1-for-1"
                selected={mode === "1for1"}
                onPress={() => setMode("1for1")}
              />
              <Chip
                testID="mode-2for1"
                label="2-for-1"
                selected={mode === "2for1"}
                onPress={() => setMode("2for1")}
              />
            </View>
          </View>
          <View style={styles.sortGroup}>
            <Text style={styles.filterLabel}>Rank by</Text>
            <Chip
              label={
                sort === "fair"
                  ? "Fairness"
                  : sort === "you"
                    ? "Your gain"
                    : "VORP"
              }
              onPress={() =>
                setSort((current) =>
                  current === "fair"
                    ? "you"
                    : current === "you"
                      ? "vorp"
                      : "fair"
                )
              }
            />
          </View>
        </View>
        <Filters
          trades={trades}
          opponentId={opponentId}
          position={position}
          onOpponent={setOpponentId}
          onPosition={setPosition}
        />
      </Card>
      {error ? (
        <InlineBanner
          tone="danger"
          title="Trade feed unavailable"
          message={error}
          actionLabel="Retry"
          onAction={() => onReload?.()}
        />
      ) : null}
      {error ? null : emptyCopy ? (
        <EmptyState
          title={emptyCopy}
          description="Try another package, opponent, or position filter."
        />
      ) : showWorkshop ? (
        <Workshop
          trade={selected}
          onClear={() => {
            setSelected(null);
            setWorkshopOwner?.(null);
          }}
          clearLabel="Dismiss"
          leagueId={leagueId}
          onReload={onReload}
        />
      ) : desktop ? (
        <Card testID="trade-table" style={styles.table}>
          <Header />
          {visible.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Trade ${item.send} for ${item.receive} with ${item.teamBName}`}
              onPress={() => {
                setSelected(item);
                setWorkshopOwner?.("trades");
              }}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.tradePressed,
              ]}
            >
              <Text style={styles.cell}>{item.send}</Text>
              <Text style={styles.cell}>{item.receive}</Text>
              <Text style={styles.cell}>{item.teamBName}</Text>
              <Text
                style={[
                  styles.cell,
                  styles.deltaCell,
                  item.teamADelta >= 0
                    ? styles.deltaPositive
                    : styles.deltaNegative,
                ]}
              >
                {formatDelta(item.teamADelta)}
              </Text>
              <Text
                style={[
                  styles.cell,
                  styles.deltaCell,
                  item.teamBDelta >= 0
                    ? styles.deltaPositive
                    : styles.deltaNegative,
                ]}
              >
                {formatDelta(item.teamBDelta)}
              </Text>
            </Pressable>
          ))}
        </Card>
      ) : (
        <View testID="trade-cards" style={styles.tradeCards}>
          {visible.map((item) => (
            <TradeCard
              key={item.id}
              item={item}
              onPress={() => {
                setSelected(item);
                setWorkshopOwner?.("trades");
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dashboard: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  controls: {
    gap: spacing.lg,
    backgroundColor: colors.surfaceRaised,
  },
  controlTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  controlGroup: {
    flex: 1,
    minWidth: 210,
    gap: spacing.sm,
  },
  sortGroup: {
    gap: spacing.sm,
  },
  filterGroups: {
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  filterGroup: {
    gap: spacing.sm,
  },
  filterLabel: {
    ...typography.sectionLabel,
    color: colors.textMuted,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  table: {
    padding: 0,
    overflow: "hidden",
  },
  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  header: {
    minHeight: 46,
    backgroundColor: colors.surfaceMuted,
  },
  headerText: {
    ...typography.sectionLabel,
    color: colors.textMuted,
  },
  cell: {
    flex: 1,
    minWidth: 0,
    ...typography.caption,
    color: colors.textSecondary,
  },
  deltaCell: {
    ...typography.stat,
  },
  tradeCards: {
    gap: spacing.md,
  },
  tradeCard: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    gap: spacing.lg,
  },
  tradePressed: {
    opacity: 0.72,
    backgroundColor: colors.surfaceRaised,
  },
  tradeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  tradeCardEyebrow: {
    ...typography.sectionLabel,
    color: colors.textMuted,
    marginBottom: 2,
  },
  tradeOpponent: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  tradeDeltaPair: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  tradeFlow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
  tradeSideLabel: {
    ...typography.sectionLabel,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  tradePlayer: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  tradeArrow: {
    color: colors.info,
    fontSize: 20,
    fontWeight: "800",
  },
  tradeImpact: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  tradeImpactItem: {
    flex: 1,
  },
  tradeImpactDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  tradeImpactLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  tradeImpactValue: {
    ...typography.stat,
    marginTop: 2,
  },
  deltaPositive: {
    color: colors.success,
  },
  deltaNegative: {
    color: colors.danger,
  },
});
