import { darkPalette } from "@/theme/palette";

// The app ships permanently dark: COLORS *is* the "SaaS Futuristic" palette
// (see theme/palette.ts). `primaryDark` keeps mapping to the brighter violet so
// existing call sites that use it for high-contrast brand text/links stay legible
// on the dark canvas.
export const COLORS = {
  ...darkPalette,
  primaryDark: darkPalette.primaryLight,
};

export type ColorKey = keyof typeof COLORS;

// Landing typography: Montserrat for everything, DM Mono for the small
// uppercase eyebrow labels. Loaded in app/_layout.tsx — RN ignores fontWeight
// on custom fonts, so styles must set fontFamily from FONTS, not FONT_WEIGHTS.
export const FONTS = {
  display: "Montserrat_800ExtraBold",
  black: "Montserrat_800ExtraBold",
  bold: "Montserrat_700Bold",
  semibold: "Montserrat_600SemiBold",
  medium: "Montserrat_500Medium",
  regular: "Montserrat_400Regular",
  body: "Montserrat_400Regular",
  mono: "DMMono_400Regular",
  monoMedium: "DMMono_500Medium",
} as const;

// Violet → magenta accent gradients (ported from the landing theme).
export const GRADIENTS = {
  // Primary CTA sweep — pair with GradientFill on buttons / FABs.
  primary: ["#7C3AED", "#9525C9", "#C925AB"],
  accent: ["#C925AB", "#9525C9"],
  // Headline accent (violet → magenta → violet), for GradientText.
  text: ["#BB9BFF", "#C925AB", "#7C3AED"],
  card: ["#7C3AED", "#591DDD"],
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

// Landing geometry: 20px (1.25rem) glass cards, fully pill-shaped controls,
// rounded-square logo/icon wells.
export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

// Glow-based depth. On the dark canvas, the violet CTA glow and the featured
// ring carry elevation more than black drop-shadows do.
export const SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
    elevation: 8,
  },
  soft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 4,
  },
  // Violet CTA glow.
  accent: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 10,
  },
  // Featured / highlighted surface ring (magenta-violet).
  ring: {
    shadowColor: "#9525C9",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 12,
  },
  pop: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 10,
  },
} as const;
