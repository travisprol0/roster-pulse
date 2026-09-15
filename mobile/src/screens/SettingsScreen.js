import { useEffect, useState } from "react";
import { Button, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { saveEspnCredentials } from "../api/espnCredentials";

function emptyLeague() {
  return { leagueId: "", espn_s2: "", swid: "" };
}

export default function SettingsScreen({ onSaved, savedLeagues = [] }) {
  const [leagues, setLeagues] = useState([emptyLeague()]);
  const [expanded, setExpanded] = useState(savedLeagues.length === 0);
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    setExpanded(savedLeagues.length === 0);
  }, [savedLeagues]);

  function toggleExpanded() {
    setExpanded((current) => !current);
  }

  function updateLeague(index, field, value) {
    setLeagues((current) =>
      current.map((league, i) => (i === index ? { ...league, [field]: value } : league))
    );
  }

  function onSubmit() {
    // #region agent log
    fetch("http://127.0.0.1:7257/ingest/09ed06f5-2a1a-412c-960f-6f6e174b9c44", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "1de000",
      },
      body: JSON.stringify({
        sessionId: "1de000",
        hypothesisId: "A",
        location: "SettingsScreen.js:onSubmit",
        message: "submit pressed",
        data: {
          expanded,
          rowCount: leagues.length,
          fields: leagues.map((row) => ({
            leagueIdLen: (row.leagueId || "").trim().length,
            espnLen: (row.espn_s2 || "").trim().length,
            swidLen: (row.swid || "").trim().length,
          })),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    saveEspnCredentials({ leagues })
      .then(async (response) => {
        // #region agent log
        fetch("http://127.0.0.1:7257/ingest/09ed06f5-2a1a-412c-960f-6f6e174b9c44", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "1de000",
          },
          body: JSON.stringify({
            sessionId: "1de000",
            hypothesisId: "B",
            location: "SettingsScreen.js:onSubmit.then",
            message: "saveEspnCredentials settled",
            data: { ok: response?.ok, status: response?.status },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        let body = {};
        if (typeof response?.json === "function") {
          body = await response.json();
        }
        const unauthorized = (body.leagues || []).some(
          (row) => row.status === "unauthorized"
        );
        setSyncError(unauthorized ? "Could not sync: unauthorized" : "");
        onSaved?.();
      })
      .catch((err) => {
        // #region agent log
        fetch("http://127.0.0.1:7257/ingest/09ed06f5-2a1a-412c-960f-6f6e174b9c44", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "1de000",
          },
          body: JSON.stringify({
            sessionId: "1de000",
            hypothesisId: "B",
            location: "SettingsScreen.js:onSubmit.catch",
            message: "saveEspnCredentials rejected",
            data: { name: err?.name, text: String(err) },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      });
  }

  return (
    <View style={styles.content}>
      <Pressable onPress={toggleExpanded}>
        <Text onPress={toggleExpanded} style={styles.header}>
          Leagues / cookies
        </Text>
      </Pressable>
      {syncError ? <Text>{syncError}</Text> : null}
      {expanded ? (
        <>
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
              {leagues.length > 1 ? (
                <Button
                  title="Remove league"
                  onPress={() =>
                    setLeagues((current) => current.filter((_, i) => i !== index))
                  }
                />
              ) : null}
            </View>
          ))}
          <View style={styles.actions}>
            <Button
              title="Add league"
              onPress={() => setLeagues((current) => [...current, emptyLeague()])}
            />
            <Button title="Submit" onPress={onSubmit} />
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
