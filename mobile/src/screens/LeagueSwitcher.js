import { Pressable, StyleSheet, Text, View } from "react-native";

export default function LeagueSwitcher({ leagues, onSelect }) {
  return (
    <View testID="league-switcher" style={styles.row}>
      {leagues.map((league) => (
        <Pressable key={league.id} onPress={() => onSelect(league.id)}>
          <Text>{league.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 16,
    padding: 12,
  },
});
