import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { copyText } from "../clipboard";
import { proposeTrade } from "../api/evaluate";

function formatDelta(delta) {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

export function pitchText(trade) {
  return `Send ${trade.send} to ${trade.teamBName} for ${trade.receive}. Your delta ${trade.teamADelta}, their delta ${trade.teamBDelta}.`;
}

export default function Workshop({ trade, onClear, clearLabel, leagueId, onReload }) {
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
      <Text>{trade.mutual ? "Mutual" : "Not mutual"}</Text>
      {writeError ? <Text>{writeError}</Text> : null}
      <Pressable onPress={onCopy}>
        <Text>Copy pitch</Text>
      </Pressable>
      {leagueId ? (
        <Pressable onPress={onPropose}>
          <Text>Propose on ESPN</Text>
        </Pressable>
      ) : null}
      <Pressable onPress={onClear}>
        <Text>{clearLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  workshop: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    gap: 4,
  },
  workshopTitle: {
    fontWeight: "700",
  },
});
