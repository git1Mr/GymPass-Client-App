// app/constants/theme.ts
// Updated palette: #9f99c7 primary (lavender) + #3C0008 accent (deep burgundy)

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
  success: "#1E8A4C",
  warning: "#F59E0B",

  // Tab bar
  tabActive: "#3C0008",
  tabInactive: "#9f99c7",
  tabBar: "#FFFFFF",

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

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
} as const;

// // app/constants/theme.ts

// import { TextStyle } from "react-native";

// export const COLORS = {
//   primary: "#3C0008",
//   primaryLight: "#6B0010",
//   primaryDark: "#1E0004",
//   accent: "#FF2D55",
//   accentMuted: "#C0162E",

//   background: "#0A0002",
//   surface: "#160005",
//   surfaceElevated: "#220008",
//   border: "#3C0018",
//   borderFocus: "#FF2D55",

//   text: "#F5E6E8",
//   textSecondary: "#A07880",
//   textMuted: "#5C3840",
//   textOnPrimary: "#FFFFFF",

//   error: "#FF453A",
//   success: "#32D74B",
//   warning: "#FFD60A",

//   white: "#FFFFFF",
//   black: "#000000",
//   transparent: "transparent",
// } as const;

// export type ColorKey = keyof typeof COLORS;

// export const FONTS = {
//   display: "serif",
//   body: "System",
//   mono: "monospace",
// } as const;

// export const FONT_SIZES = {
//   xs: 11,
//   sm: 13,
//   base: 15,
//   md: 17,
//   lg: 20,
//   xl: 24,
//   xxl: 32,
//   hero: 48,
// } as const;

// // Typed as TextStyle['fontWeight'] so StyleSheet accepts them without casting
// export const FONT_WEIGHTS: Record<string, TextStyle["fontWeight"]> = {
//   regular: "400",
//   medium: "500",
//   semibold: "600",
//   bold: "700",
//   black: "900",
// };

// export const SPACING = {
//   xs: 4,
//   sm: 8,
//   md: 16,
//   lg: 24,
//   xl: 32,
//   xxl: 48,
//   xxxl: 64,
// } as const;

// export const RADIUS = {
//   sm: 6,
//   md: 12,
//   lg: 20,
//   full: 999,
// } as const;

// export const SHADOWS = {
//   glow: {
//     shadowColor: "#FF2D55",
//     shadowOffset: { width: 0, height: 0 } as const,
//     shadowOpacity: 0.35,
//     shadowRadius: 20,
//     elevation: 12,
//   },
//   card: {
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 } as const,
//     shadowOpacity: 0.4,
//     shadowRadius: 12,
//     elevation: 8,
//   },
// } as const;
