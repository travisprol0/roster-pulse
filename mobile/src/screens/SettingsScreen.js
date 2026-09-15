import { useState } from "react";
import { Button, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { saveEspnCredentials } from "../api/espnCredentials";
import { deleteLeague } from "../api/leagues";

function emptyLeague() {
  return { leagueId: "", espn_s2: "", swid: "" };
}

function fromSaved(savedLeagues) {
  if (!savedLeagues.length) {
    return [emptyLeague()];
  }
  return savedLeagues.map((league) => ({
    leagueId: String(league.id),
    espn_s2: "",
    swid: "",
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
    const incomplete = leagues.some(
      (row) =>
        !(row.leagueId || "").trim() || !(row.espn_s2 || "").trim() || !(row.swid || "").trim()
    );
    if (incomplete) {
      setSyncError("Each league needs ID, espn_s2, and SWID");
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
    <View style={styles.content}>
      <Pressable onPress={toggleExpanded}>
        <Text style={styles.header}>Leagues / cookies</Text>
      </Pressable>
      {syncError ? <Text>{syncError}</Text> : null}
      {syncOk ? <Text>{syncOk}</Text> : null}
      {expanded ? (
        <>
          <Text style={styles.label}>Season</Text>
          <TextInput
            placeholder="2026"
            value={season}
            onChangeText={setSeason}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Text style={styles.hint}>
            Stored cookies are reused until you paste new espn_s2 and SWID.
          </Text>
          {leagues.map((league, index) => (
            <View key={index} style={styles.block}>
              <Text style={styles.heading}>League {index + 1}</Text>
              <Text style={styles.label}>League ID</Text>
              <TextInput
                placeholder={`League ID ${index + 1}`}
                value={league.leagueId}
                onChangeText={(value) => updateLeague(index, "leagueId", value)}
                autoCapitalize="none"
                style={styles.input}
              />
              <Text style={styles.label}>espn_s2</Text>
              <TextInput
                placeholder="espn_s2"
                value={league.espn_s2}
                onChangeText={(value) => updateLeague(index, "espn_s2", value)}
                autoCapitalize="none"
                secureTextEntry
                style={styles.input}
              />
              <Text style={styles.label}>SWID</Text>
              <TextInput
                placeholder="swid"
                value={league.swid}
                onChangeText={(value) => updateLeague(index, "swid", value)}
                autoCapitalize="none"
                secureTextEntry
                style={styles.input}
              />
              <Button title="Remove league" onPress={() => onRemove(index)} />
            </View>
          ))}
          <View style={styles.actions}>
            <Button
              title="Add league"
              onPress={() => setLeagues((current) => [...current, emptyLeague()])}
            />
            <Button title="Submit" onPress={onSubmit} disabled={busy} />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  header: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  hint: {
    color: "#52525b",
    marginBottom: 12,
  },
  block: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
    color: "#3f3f46",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  actions: {
    gap: 8,
  },
});
