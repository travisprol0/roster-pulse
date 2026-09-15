import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radii, shadows, spacing, typography } from "./theme";

export function Card({ children, style, elevated = false, testID }) {
  return (
    <View
      testID={testID}
      style={[styles.card, elevated && styles.cardElevated, style]}
    >
      {children}
    </View>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  style,
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionCopy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.sectionAction}>{action}</View> : null}
    </View>
  );
}

export function Chip({
  accessibilityLabel,
  accessibilityRole = "button",
  disabled = false,
  label,
  onPress,
  selected = false,
  style,
  testID,
  tone = "default",
}) {
  const toneStyle =
    tone === "positive"
      ? styles.chipPositive
      : tone === "negative"
        ? styles.chipNegative
        : tone === "warning"
          ? styles.chipWarning
          : null;
  const toneTextStyle =
    tone === "positive"
      ? styles.chipPositiveText
      : tone === "negative"
        ? styles.chipNegativeText
        : tone === "warning"
          ? styles.chipWarningText
          : null;

  return (
    <Pressable
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        toneStyle,
        selected && styles.chipSelected,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.chipText,
          toneTextStyle,
          selected && styles.chipSelectedText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ActionButton({
  accessibilityLabel,
  busy = false,
  busyLabel,
  disabled = false,
  label,
  onPress,
  style,
  testID,
  variant = "primary",
}) {
  const blocked = disabled || busy;
  const variantStyle =
    variant === "secondary"
      ? styles.buttonSecondary
      : variant === "ghost"
        ? styles.buttonGhost
        : variant === "danger"
          ? styles.buttonDanger
          : styles.buttonPrimary;
  const textStyle =
    variant === "primary"
      ? styles.buttonPrimaryText
      : variant === "danger"
        ? styles.buttonDangerText
        : styles.buttonSecondaryText;
  const renderedLabel = busy ? busyLabel || label : label;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || renderedLabel}
      accessibilityState={{ disabled: blocked, busy }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        pressed && !blocked && styles.pressed,
        blocked && styles.disabled,
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator
          testID={testID ? `${testID}-spinner` : undefined}
          size="small"
          color={variant === "primary" ? colors.accentInk : colors.text}
        />
      ) : null}
      <Text style={[styles.buttonText, textStyle]}>{renderedLabel}</Text>
    </Pressable>
  );
}

export function InlineBanner({
  actionLabel,
  message,
  onAction,
  title,
  tone = "info",
}) {
  const toneStyle =
    tone === "danger"
      ? styles.bannerDanger
      : tone === "success"
        ? styles.bannerSuccess
        : tone === "warning"
          ? styles.bannerWarning
          : styles.bannerInfo;
  const toneTextStyle =
    tone === "danger"
      ? styles.bannerDangerText
      : tone === "success"
        ? styles.bannerSuccessText
        : tone === "warning"
          ? styles.bannerWarningText
          : styles.bannerInfoText;

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, toneStyle]}
    >
      <View style={styles.bannerCopy}>
        {title ? <Text style={[styles.bannerTitle, toneTextStyle]}>{title}</Text> : null}
        {message ? <Text style={styles.bannerMessage}>{message}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <ActionButton
          label={actionLabel}
          onPress={onAction}
          variant="ghost"
          style={styles.bannerAction}
        />
      ) : null}
    </View>
  );
}

export function EmptyState({
  actionLabel,
  description,
  onAction,
  title,
  style,
}) {
  return (
    <Card style={[styles.emptyState, style]}>
      <View style={styles.emptyMark}>
        <Text style={styles.emptyMarkText}>RP</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.emptyDescription}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <ActionButton
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          style={styles.emptyAction}
        />
      ) : null}
    </Card>
  );
}

export function LoadingState({ label = "Loading", testID }) {
  return (
    <Card testID={testID} style={styles.loading}>
      <ActivityIndicator color={colors.accent} />
      <Text style={styles.loadingText}>{label}</Text>
    </Card>
  );
}

export function StatPill({ label, tone = "default" }) {
  const pillStyle =
    tone === "positive"
      ? styles.statPillPositive
      : tone === "negative"
        ? styles.statPillNegative
        : tone === "warning"
          ? styles.statPillWarning
          : null;
  const textStyle =
    tone === "positive"
      ? styles.statPillPositiveText
      : tone === "negative"
        ? styles.statPillNegativeText
        : tone === "warning"
          ? styles.statPillWarningText
          : null;

  return (
    <View style={[styles.statPill, pillStyle]}>
      <Text style={[styles.statPillText, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  cardElevated: {
    backgroundColor: colors.surfaceRaised,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    ...typography.sectionLabel,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  sectionAction: {
    flexShrink: 0,
  },
  chip: {
    minHeight: 44,
    maxWidth: "100%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  chipPositive: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
  },
  chipNegative: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  chipWarning: {
    borderColor: colors.warning,
    backgroundColor: colors.warningSoft,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  chipSelectedText: {
    color: colors.accentInk,
  },
  chipPositiveText: {
    color: colors.success,
  },
  chipNegativeText: {
    color: colors.danger,
  },
  chipWarningText: {
    color: colors.warning,
  },
  button: {
    minHeight: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  buttonSecondary: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.borderStrong,
  },
  buttonGhost: {
    backgroundColor: colors.transparent,
    borderColor: colors.transparent,
  },
  buttonDanger: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
  },
  buttonText: {
    ...typography.bodyStrong,
    textAlign: "center",
  },
  buttonPrimaryText: {
    color: colors.accentInk,
  },
  buttonSecondaryText: {
    color: colors.text,
  },
  buttonDangerText: {
    color: colors.danger,
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.5,
  },
  banner: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  bannerInfo: {
    backgroundColor: colors.infoSoft,
    borderColor: colors.info,
  },
  bannerSuccess: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  bannerWarning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
  },
  bannerDanger: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
  },
  bannerCopy: {
    flex: 1,
    minWidth: 0,
  },
  bannerTitle: {
    ...typography.bodyStrong,
  },
  bannerInfoText: {
    color: colors.info,
  },
  bannerSuccessText: {
    color: colors.success,
  },
  bannerWarningText: {
    color: colors.warning,
  },
  bannerDangerText: {
    color: colors.danger,
  },
  bannerMessage: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bannerAction: {
    paddingHorizontal: spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyMark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyMarkText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: "900",
  },
  emptyTitle: {
    ...typography.bodyStrong,
    color: colors.text,
    textAlign: "center",
  },
  emptyDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
    maxWidth: 440,
  },
  emptyAction: {
    marginTop: spacing.lg,
  },
  loading: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  statPillPositive: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
  },
  statPillNegative: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  statPillWarning: {
    borderColor: colors.warning,
    backgroundColor: colors.warningSoft,
  },
  statPillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  statPillPositiveText: {
    color: colors.success,
  },
  statPillNegativeText: {
    color: colors.danger,
  },
  statPillWarningText: {
    color: colors.warning,
  },
});
