import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Card, Chip } from "../ui/primitives";
import { colors, spacing, typography } from "../ui/theme";

export default function LeagueSwitcher({ leagues, onSelect, selectedId }) {
  if (!leagues.length) {
    return (
      <Card>
        <Text style={styles.eyebrow}>Active league</Text>
        <Text testID="league-switcher" style={styles.empty}>
          Add a league in settings, then pick it here.
        </Text>
      </Card>
    );
  }
  return (
    <Card style={styles.shell}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Active league</Text>
        <Text style={styles.helper}>Switch the dashboard context</Text>
      </View>
      <ScrollView
        testID="league-switcher"
        accessibilityRole="tablist"
        accessibilityLabel="Leagues"
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {leagues.map((league) => {
          const selected = league.id === selectedId;
          return (
            <Chip
              key={league.id}
              testID={`league-tab-${league.id}`}
              accessibilityRole="tab"
              accessibilityLabel={league.name}
              label={league.name}
              selected={selected}
              onPress={() => onSelect(league.id)}
            />
          );
        })}
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: spacing.md,
  },
  copy: {
    gap: 1,
  },
  eyebrow: {
    ...typography.sectionLabel,
    color: colors.accent,
  },
  helper: {
    ...typography.caption,
    color: colors.textMuted,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  row: {
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
});
