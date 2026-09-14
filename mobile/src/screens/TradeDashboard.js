import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

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

export default function TradeDashboard({ leagueId }) {
  const [loading, setLoading] = useState(Boolean(leagueId));
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    if (!leagueId) {
      setLoading(false);
      setTrades([]);
      return;
    }
    setLoading(true);
    fetchTrades(leagueId)
      .then((data) => {
        setTrades(data.trades);
        setLoading(false);
      })
      .catch(() => {
        setTrades([]);
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
      ) : (
        trades.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.cell}>{item.send}</Text>
            <Text style={styles.cell}>{item.receive}</Text>
            <Text style={styles.cell}>{formatDelta(item.teamADelta)}</Text>
            <Text style={styles.cell}>{formatDelta(item.teamBDelta)}</Text>
          </View>
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
});
