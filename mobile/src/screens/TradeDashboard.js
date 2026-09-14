import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { fetchTrades } from "../api/trades";
import { copyText } from "../clipboard";

function formatDelta(delta) {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function pitchText(trade) {
  return `Send ${trade.send} to ${trade.teamBName} for ${trade.receive}. Your delta ${trade.teamADelta}, their delta ${trade.teamBDelta}.`;
}

function Filters({ trades, onOpponent, onPosition }) {
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
    <View style={styles.filters}>
      <Pressable testID="filter-opponent-all" onPress={() => onOpponent("all")}>
        <Text onPress={() => onOpponent("all")}>All opponents</Text>
      </Pressable>
      {opponents.map((opponent) => (
        <Pressable
          key={String(opponent.id)}
          testID={`filter-opponent-${opponent.id}`}
          onPress={() => onOpponent(opponent.id)}
        >
          <Text onPress={() => onOpponent(opponent.id)}>vs {opponent.name}</Text>
        </Pressable>
      ))}
      <Pressable testID="filter-position-all" onPress={() => onPosition("all")}>
        <Text onPress={() => onPosition("all")}>All positions</Text>
      </Pressable>
      {["QB", "RB", "WR", "TE"].map((pos) => (
        <Pressable
          key={pos}
          testID={`filter-position-${pos}`}
          onPress={() => onPosition(pos)}
        >
          <Text onPress={() => onPosition(pos)}>{pos}</Text>
        </Pressable>
      ))}
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

function Workshop({ trade, onDismiss }) {
  return (
    <View style={styles.workshop}>
      <Text style={styles.workshopTitle}>Workshop</Text>
      <Text>{trade.teamBName}</Text>
      <Text>{trade.send}</Text>
      <Text>{trade.receive}</Text>
      <Text>{formatDelta(trade.teamADelta)}</Text>
      <Text>{formatDelta(trade.teamBDelta)}</Text>
      <Text>{trade.beforeA}</Text>
      <Text>{trade.afterA}</Text>
      <Text>{trade.beforeB}</Text>
      <Text>{trade.afterB}</Text>
      <Pressable onPress={() => copyText(pitchText(trade))}>
        <Text onPress={() => copyText(pitchText(trade))}>Copy pitch</Text>
      </Pressable>
      <Pressable onPress={onDismiss}>
        <Text onPress={onDismiss}>Dismiss</Text>
      </Pressable>
    </View>
  );
}

export default function TradeDashboard({ leagueId }) {
  const [loading, setLoading] = useState(Boolean(leagueId));
  const [trades, setTrades] = useState([]);
  const [selected, setSelected] = useState(null);
  const [opponentId, setOpponentId] = useState("all");
  const [position, setPosition] = useState("all");

  useEffect(() => {
    if (!leagueId) {
      setLoading(false);
      setTrades([]);
      setSelected(null);
      setOpponentId("all");
      setPosition("all");
      return;
    }
    setLoading(true);
    fetchTrades(leagueId)
      .then((data) => {
        setTrades(data.trades);
        setSelected(null);
        setOpponentId("all");
        setPosition("all");
        setLoading(false);
      })
      .catch(() => {
        setTrades([]);
        setSelected(null);
        setOpponentId("all");
        setPosition("all");
        setLoading(false);
      });
  }, [leagueId]);

  if (loading) {
    return <ActivityIndicator testID="loading" />;
  }

  if (!leagueId) {
    return (
      <Text style={styles.empty}>Add a league in settings, then pick it here.</Text>
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

  return (
    <View style={styles.table}>
      <Filters
        trades={trades}
        onOpponent={setOpponentId}
        onPosition={setPosition}
      />
      <Header />
      {trades.length === 0 ? (
        <Text style={styles.empty}>No mutually beneficial trades.</Text>
      ) : selected ? (
        <Workshop trade={selected} onDismiss={() => setSelected(null)} />
      ) : (
        visible.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setSelected(item)}
            style={styles.row}
          >
            <Text style={styles.cell} onPress={() => setSelected(item)}>
              {item.send}
            </Text>
            <Text style={styles.cell}>{item.receive}</Text>
            <Text style={styles.cell}>{item.teamBName}</Text>
            <Text style={styles.cell}>{formatDelta(item.teamADelta)}</Text>
            <Text style={styles.cell}>{formatDelta(item.teamBDelta)}</Text>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  header: {
    backgroundColor: "#f4f4f5",
  },
  headerText: {
    fontWeight: "700",
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cell: {
    flex: 1,
  },
  empty: {
    padding: 16,
    color: "#52525b",
  },
  workshop: {
    padding: 16,
  },
  workshopTitle: {
    fontWeight: "700",
  },
});
