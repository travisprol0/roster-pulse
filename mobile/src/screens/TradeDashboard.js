import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { fetchTrades } from "../api/trades";
import Workshop from "./Workshop";

function formatDelta(delta) {
  return delta > 0 ? `+${delta}` : `${delta}`;
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
        <Text>All opponents</Text>
      </Pressable>
      {opponents.map((opponent) => (
        <Pressable
          key={String(opponent.id)}
          testID={`filter-opponent-${opponent.id}`}
          onPress={() => onOpponent(opponent.id)}
        >
          <Text>vs {opponent.name}</Text>
        </Pressable>
      ))}
      <Pressable testID="filter-position-all" onPress={() => onPosition("all")}>
        <Text>All positions</Text>
      </Pressable>
      {["QB", "RB", "WR", "TE", "K", "DST"].map((pos) => (
        <Pressable
          key={pos}
          testID={`filter-position-${pos}`}
          onPress={() => onPosition(pos)}
        >
          <Text>{pos}</Text>
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

export default function TradeDashboard({
  leagueId,
  reloadToken = 0,
  onReload,
  workshopOwner,
  setWorkshopOwner,
}) {
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
    ? error
    : trades.length === 0
      ? "No mutually beneficial trades."
      : visible.length === 0
        ? "No trades match filters."
        : "";

  return (
    <View style={styles.table}>
      <View style={styles.filters}>
        <Pressable onPress={() => setMode("1for1")}>
          <Text>1-for-1</Text>
        </Pressable>
        <Pressable onPress={() => setMode("2for1")}>
          <Text>2-for-1</Text>
        </Pressable>
      </View>
      <Pressable
        onPress={() =>
          setSort((current) =>
            current === "fair" ? "you" : current === "you" ? "vorp" : "fair"
          )
        }
      >
        <Text>
          {sort === "fair" ? "Fairness" : sort === "you" ? "Your gain" : "VORP"}
        </Text>
      </Pressable>
      <Filters trades={trades} onOpponent={setOpponentId} onPosition={setPosition} />
      <Header />
      {error ? (
        <Pressable onPress={() => onReload?.()}>
          <Text>Retry</Text>
        </Pressable>
      ) : null}
      {emptyCopy ? (
        <Text style={styles.empty}>{emptyCopy}</Text>
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
      ) : (
        visible.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              setSelected(item);
              setWorkshopOwner?.("trades");
            }}
            style={styles.row}
          >
            <Text style={styles.cell}>{item.send}</Text>
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
});
