# Unity Fitness — Lavender refresh

Drop-in replacements for your Expo / `gympass-client` app that swap the
DIXIE-style orange theme for **`COLORS.primary` (lavender `#9f99c7`)** from
your existing `constants/theme.ts`, introduce a "U" logomark for the
auth screens, and redesign the QR check-in modal in the "Checked in"
style of the Gympass screenshot.

## What's inside

```
expo-edits/
├── app/
│   ├── splash.tsx           ← REPLACES gympass-client/app/splash.tsx
│   ├── (auth)/
│   │   ├── login.tsx        ← REPLACES gympass-client/app/(auth)/login.tsx
│   │   └── register.tsx     ← REPLACES gympass-client/app/(auth)/register.tsx
│   └── (tabs)/
│       ├── index.tsx        ← REPLACES gympass-client/app/(tabs)/index.tsx
│       └── profile.tsx      ← REPLACES gympass-client/app/(tabs)/profile.tsx
└── components/
    ├── ui/
    │   ├── UFLogo.tsx          ← NEW — glossy burgundy "U" tile (SVG)
    │   ├── LightPillar.tsx     ← NEW — animated vertical light-pillar background
    │   └── GradientSurface.tsx ← NEW — burgundy → lavender gradient w/ crosshatch
    └── AccessAnyGym.tsx     ← REPLACES gympass-client/components/AccessAnyGym.tsx
```

## How to apply

1. Copy `components/ui/UFLogo.tsx` and `components/ui/LightPillar.tsx`
   into `gympass-client/components/ui/`
2. Overwrite the five existing files with the new versions
3. Run as usual — no new packages, no `theme.ts` changes needed

## The light-pillar motif

The brand's circular-blob decoration is replaced everywhere by a
**vertical pillar of lavender light**. `<LightPillar>` renders six
overlapping bezier-stroke paths with gradient fills, widths stepping
from 240px (broad halo) down to 2px (bright white core). It runs an
internal breathing loop (3.6s sine in/out on inner-layer opacity) and a
core-width drift (5.2s ease in/out) so the background reads as alive
without being distracting.

`seed="A"` curves top-right → bottom-left (used on splash and auth).
`seed="B"` is a near-vertical twin streak (used on profile hero and QR
sheet). Pick whichever fits the layout; both share gradients so they
read as the same effect.

react-native-svg does not reliably support `feGaussianBlur` on device,
so the glow is faked by layering wider, more-transparent paths under
narrower, brighter ones. The visual result is close to the reference
photo without depending on platform-specific filter support.

All files import from your existing `@/constants/theme`, `@/components/ui/*`,
`@/context/AuthContext`, etc. They use only deps already in your
`package.json` (`react-native-svg`, `react-native-qrcode-svg`,
`react-native-safe-area-context`, `@expo/vector-icons`, `expo-router`).

## What changed, screen by screen

### `login.tsx` / `register.tsx`
- Full-bleed **lavender hero** at the top (`COLORS.primary`) with the
  burgundy decorative blob from the design system's "Hero surfaces"
  pattern.
- New **`<UFLogo>`** mark centered in the hero — white rounded tile,
  burgundy U glyph, small lavender accent dot inside the U.
- White form panel with `RADIUS.xl` top corners, overlapping the hero
  by `-32px` (same recipe as the bottom-sheet pattern).
- Primary CTA recolored from burgundy → **lavender** with a lavender
  glow shadow (`shadowColor: primary`).
- "Forgot password?" and "Create Account" links use
  `COLORS.primaryDark` for a slightly stronger lavender than text.
- Remember-me checkbox active state is lavender (was burgundy).

### `profile.tsx`
- Whole screen rendered **dark** (matching the screenshot — dark mode
  is the visual reference). If you wire `DarkMode` to a real theme
  context later, the toggle on the screen reflects the truth.
- **Hero card** uses the same lavender → primaryDark → accent gradient
  that's already in `index.tsx`'s home hero — visual continuity.
- Avatar circle, edit button, loyalty progress bar with white track.
- **Section labels** are now the dot-prefixed lavender style from the
  screenshot (`• General`, `• My Club`, etc.) — a clear shift from
  the muted-grey uppercase that was there before.
- Cards: dark surface (`rgba(255,255,255,0.04)`) with hairline border,
  lavender-tinted icon containers.
- Rows support **badges** (red dot for counts) and **toggles** (lavender
  active track) in addition to value/chevron.
- Sign-out is a centered outlined pill at the bottom (not a danger
  row inside the last section).

### `components/AccessAnyGym.tsx`
- Modal is now **full-screen** instead of a bottom sheet (`animationType: "slide"`).
- Lavender hero with:
  - **Close X** in a white-translucent circle, top right.
  - "LIVE PASS" status pill with a small green dot.
  - 40px black "Checked in" headline.
  - Subtitle explaining the 10s rotation.
- Two stacked white cards below the hero:
  - **Gym card** — tinted icon tile + gym name + "Gym access · 2 pts".
  - **QR card** — "Hide Code" toggle row, the QR itself bordered in
    lavender, and a lavender-tinted countdown footer pill showing
    `{secondsLeft}s` + "Secured pass · Rotates every 10s".
- The rotation/expiry/pulse logic is **unchanged** — only the visuals.
- Pill trigger now uses `COLORS.primary` for the icon (was `accent`).

## Substitutions / things to confirm

1. **Gym name in the QR sheet** — hard-coded to "Iron Forge Casablanca"
   as a placeholder. Wire to the user's selected/last-visited gym
   from your `Gym` type when you have that data on hand.
2. **Toggle persistence** — `darkMode` in `profile.tsx` is local
   state, not wired to a real theme. The screen renders dark
   regardless of the toggle right now; it's purely a UI demo until
   you decide how to do dark/light theming app-wide.
3. **Light-mode profile** — if you'd prefer the profile to stay
   light-themed by default (matching the rest of the app today),
   tell me and I'll fork it back to a light variant that keeps the
   new sections-with-dots + badge + toggle row patterns.
4. **`UFLogo` glyph** — current shape is a wide-stance U with a small
   lavender dot inside. If you have a real brand logo, drop it in
   place of this component's contents — everywhere else uses
   `<UFLogo size={…} />` so swapping the implementation is enough.

## Visual preview

The companion `index.html` in the project root renders these three
screens in Android frames inside a design canvas — pan/zoom, click any
artboard to view fullscreen, drag to reorder. Use it for sign-off
before merging.
