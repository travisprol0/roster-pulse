import { useState } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";

import { saveEspnCredentials } from "../api/espnCredentials";

export default function SettingsScreen() {
  const [leagueId, setLeagueId] = useState("");
  const [espnS2, setEspnS2] = useState("");
  const [swid, setSwid] = useState("");

  function onSubmit() {
    saveEspnCredentials({
      leagueId,
      espn_s2: espnS2,
      swid,
    });
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="League ID"
        value={leagueId}
        onChangeText={setLeagueId}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="espn_s2"
        value={espnS2}
        onChangeText={setEspnS2}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="swid"
        value={swid}
        onChangeText={setSwid}
        autoCapitalize="none"
      />
      <Button title="Submit" onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
});
