import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { fetchTrades } from "../api/trades";

function formatDelta(delta) {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function Header() {
  return (
    <View style={[styles.row, styles.header]}>
      <Text style={[styles.cell, styles.headerText]}>You send</Text>
      <Text style={[styles.cell, styles.headerText]}>You receive</Text>
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

  useEffect(() => {
    if (!leagueId) {
      setLoading(false);
      setTrades([]);
      setSelected(null);
      return;
    }
    setLoading(true);
    fetchTrades(leagueId)
      .then((data) => {
        setTrades(data.trades);
        setSelected(null);
        setLoading(false);
      })
      .catch(() => {
        setTrades([]);
        setSelected(null);
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

  return (
    <View style={styles.table}>
      <Header />
      {trades.length === 0 ? (
        <Text style={styles.empty}>No mutually beneficial trades.</Text>
      ) : selected ? (
        <Workshop trade={selected} onDismiss={() => setSelected(null)} />
      ) : (
        trades.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setSelected(item)}
            style={styles.row}
          >
            <Text style={styles.cell} onPress={() => setSelected(item)}>
              {item.send}
            </Text>
            <Text style={styles.cell}>{item.receive}</Text>
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
