import { colors, radii, spacing, typography } from "../ui/theme";

test("exports the dark sports-dashboard color roles", () => {
  expect(colors).toEqual(
    expect.objectContaining({
      canvas: "#070B12",
      surface: "#111827",
      surfaceRaised: "#172033",
      border: "#2A374A",
      text: "#F8FAFC",
      textSecondary: "#CBD5E1",
      textMuted: "#94A3B8",
      accent: "#A3E635",
      info: "#38BDF8",
      success: "#4ADE80",
      warning: "#FBBF24",
      danger: "#FB7185",
    })
  );
  expect(colors.canvas).not.toBe(colors.surface);
  expect(colors.text).not.toBe(colors.textMuted);
});

test("exports one spacing and radius scale for every screen", () => {
  expect(spacing).toEqual({
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  });
  expect(radii).toEqual({
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
  });
});

test("includes hierarchy and tabular stat typography", () => {
  expect(typography.display.fontSize).toBeGreaterThan(typography.title.fontSize);
  expect(typography.sectionLabel.textTransform).toBe("uppercase");
  expect(typography.stat.fontVariant).toContain("tabular-nums");
});
