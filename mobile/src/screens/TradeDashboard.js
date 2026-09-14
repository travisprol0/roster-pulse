import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { fetchTrades } from "../api/trades";

function formatDelta(delta) {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

export default function TradeDashboard() {
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    fetchTrades().then((data) => {
      setTrades(data.trades);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <ActivityIndicator testID="loading" />;
  }

  return (
    <FlatList
      data={trades}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text>{item.send}</Text>
          <Text>{item.receive}</Text>
          <Text>{formatDelta(item.teamADelta)}</Text>
          <Text>{formatDelta(item.teamBDelta)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    padding: 12,
  },
});
