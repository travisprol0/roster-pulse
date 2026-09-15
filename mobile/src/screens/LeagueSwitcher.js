import { Pressable, StyleSheet, Text, View } from "react-native";

export default function LeagueSwitcher({ leagues, onSelect, selectedId }) {
  if (!leagues.length) {
    return (
      <Text testID="league-switcher" style={styles.empty}>
        Add a league in settings, then pick it here.
      </Text>
    );
  }
  return (
    <View testID="league-switcher" style={styles.row}>
      {leagues.map((league) => {
        const selected = league.id === selectedId;
        return (
          <Pressable
            key={league.id}
            testID={`league-tab-${league.id}`}
            accessibilityState={{ selected }}
            onPress={() => onSelect(league.id)}
            style={[styles.tab, selected && styles.tabSelected]}
          >
            <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
              {league.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingBottom: 12,
    color: "#52525b",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#e4e4e7",
  },
  tabSelected: {
    backgroundColor: "#18181b",
  },
  tabText: {
    color: "#18181b",
    fontWeight: "600",
  },
  tabTextSelected: {
    color: "#fafafa",
  },
});
