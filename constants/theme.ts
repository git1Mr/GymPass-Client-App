export const COLORS = {
  // Brand
  primary: "#9f99c7", // soft lavender
  primaryLight: "#bfbbdc",
  primaryDark: "#7a73a8",
  primaryMuted: "#9f99c726", // 15% opacity for backgrounds

  accent: "#3C0008", // deep burgundy
  accentLight: "#6B0010",
  accentMuted: "#3C000820",

  // Surfaces
  background: "#F7F6FB", // near-white lavender tint
  surface: "#FFFFFF",
  surfaceElevated: "#EEEDF7",
  border: "#D8D6EE",
  borderFocus: "#9f99c7",

  // Text
  text: "#1A1728", // deep purple-black
  textSecondary: "#5C567A",
  textMuted: "#A09CC0",
  textOnPrimary: "#FFFFFF",
  textOnAccent: "#FFFFFF",

  // Semantic
  error: "#D93025",
  errorBg: "#FFE9E8",
  success: "#1E8A4C",
  warning: "#F59E0B",

  // Tab bar
  tabActive: "#3C0008",
  tabInactive: "#9f99c7",
  tabBar: "#FFFFFF",

  // Auth screens — change these two to restyle every auth screen at once
  authHeader: "#3C0008", // top brand panel background
  authPanel: "#F7F6FB",  // bottom form panel background (off-white so inputs stand out)

  // Wordmark
  wordmarkHighlight: "#E8723F",

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
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

export const SHADOWS = {
  card: {
    shadowColor: "#9f99c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  soft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pop: {
    shadowColor: "#3C0008",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;
