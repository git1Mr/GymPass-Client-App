import { darkPalette } from "@/theme/palette";

// The app ships permanently dark: COLORS *is* the dark palette
// (see theme/palette.ts for the values and their contrast rationale).
// `primaryDark` deliberately maps to the lighter lavender — call sites use it
// for high-contrast brand text/links, and on dark surfaces "higher contrast"
// means lighter, not darker.
export const COLORS = {
  ...darkPalette,
  primaryDark: darkPalette.primaryLight,
};

export type ColorKey = keyof typeof COLORS;

export const FONTS = {
  display: "System",
  body: "System",
} as const;

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  hero: 40,
} as const;

export const FONT_WEIGHTS: Record<string, any> = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  black: "900",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 32,
  full: 999,
} as const;

// Shadows barely render on dark backgrounds — elevation is carried by the
// surface ladder (#1E1E1E → #252525 → #2A2A2A). Keep black-based shadows at
// low opacity for Android elevation + subtle iOS depth.
export const SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  soft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  pop: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;
