import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

import { saveEspnCredentials } from "../api/espnCredentials";

function emptyLeague() {
  return { leagueId: "", espn_s2: "", swid: "" };
}

export default function SettingsScreen({ onSaved }) {
  const [leagues, setLeagues] = useState([emptyLeague()]);

  function updateLeague(index, field, value) {
    setLeagues((current) =>
      current.map((league, i) => (i === index ? { ...league, [field]: value } : league))
    );
  }

  function onSubmit() {
    saveEspnCredentials({ leagues }).then(() => {
      onSaved?.();
    });
  }

  return (
    <View style={styles.content}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
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
