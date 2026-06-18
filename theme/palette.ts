// Unity Fitness — "SaaS Futuristic" palette.
//
// Ported from the landing app's design export (frontend/apps/landing): a deep
// purple-black canvas with a violet→magenta accent spectrum, translucent glass
// surfaces over the canvas, and white→transparent gradient hairline borders.
// The mobile app ships permanently dark, so both palettes resolve to the same
// values (light mode would clash with the aurora atmosphere).

export interface Palette {
  // Brand — violet primary, magenta accent
  primary: string;        // violet  #7c3aed
  primaryLight: string;   // bright  #bb9bff
  primaryDark: string;    // violet-magenta #9525c9
  primaryMuted: string;   // translucent violet wash

  accent: string;         // magenta #c925ab
  accentLight: string;
  accentMuted: string;

  magenta: string;
  indigo: string;

  // Surfaces
  background: string;       // app root (deep purple-black)
  surface: string;          // resting card (lifted purple)
  surfaceElevated: string;  // raised / interactive
  surfaceOverlay: string;   // modals, dropdowns
  surfaceSolid: string;     // opaque chip / mark backing
  glass: string;            // translucent white for glass cards
  border: string;
  borderStrong: string;
  borderFocus: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;
  textOnAccent: string;

  // Semantic (tuned toward the neon palette)
  error: string;
  errorBg: string;
  success: string;
  warning: string;

  // Navigation chrome
  tabActive: string;
  tabInactive: string;
  tabBar: string;

  authHeader: string;
  authPanel: string;

  wordmarkHighlight: string;

  white: string;
  black: string;
  transparent: string;
}

export const darkPalette: Palette = {
  // Accent spectrum (violet → magenta glow)
  primary: "#7C3AED",
  primaryLight: "#BB9BFF",
  primaryDark: "#9525C9",
  primaryMuted: "#7C3AED29", // ~16%

  accent: "#C925AB",
  accentLight: "#E26FD0",
  accentMuted: "#C925AB26",

  magenta: "#C925AB",
  indigo: "#591DDD",

  // Canvas (deep purple-black) + lifted card surfaces
  background: "#0B0121",
  surface: "#150733",
  surfaceElevated: "#1E0A3C",
  surfaceOverlay: "#1A0838",
  surfaceSolid: "#110230",
  glass: "#FFFFFF0D",        // ~5% white — reads as glass over the aurora

  // Hairlines (white over the purple canvas)
  border: "#FFFFFF1F",       // ~12%
  borderStrong: "#FFFFFF38", // ~22%
  borderFocus: "#7C3AED",

  // Text
  text: "#ECECEC",
  textSecondary: "#ECECEC94", // ~58%
  textMuted: "#ECECEC57",     // ~34%
  textOnPrimary: "#FFFFFF",
  textOnAccent: "#FFFFFF",

  error: "#FB5A8C",
  errorBg: "#FB5A8C1F",
  success: "#22D3A7",
  warning: "#F5B73D",

  // Bottom nav: bright-violet active, faint inactive, bar melts into canvas.
  tabActive: "#BB9BFF",
  tabInactive: "#ECECEC57",
  tabBar: "#0B0121",

  authHeader: "#0B0121",
  authPanel: "#0B0121",

  wordmarkHighlight: "#BB9BFF",

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

// Permanently dark — light mode would fight the aurora atmosphere.
export const lightPalette: Palette = darkPalette;
