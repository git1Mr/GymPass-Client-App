# Unity Fitness — Design System

**Unity Fitness** (in-product also called **GymPass**) is a pay-per-use gym access app for the Moroccan market. Members buy a pack of points once, then spend 1–5 points per check-in across a tiered partner-club network. The product is delivered as a single **React Native (Expo)** app for iOS + Android.

> The in-product wordmark in the home tab reads **UNITYFITNESS**, the auth screens and toast copy use **GymPass**, and `app.json` ships as `name: "GymPass"`. Treat **Unity Fitness** as the umbrella brand and **GymPass** as the consumer-facing product name. Both are currently in use; no rationalisation has been done.

## Sources

| Source | Where | Notes |
|---|---|---|
| Mobile codebase | local mounted folder `gympass-client/` | Expo Router app, TS. The single source of truth for tokens, components, copy. |
| Theme tokens | `gympass-client/constants/theme.ts` | `COLORS`, `FONT_SIZES`, `FONT_WEIGHTS`, `SPACING`, `RADIUS`, `SHADOWS`. Lifted verbatim into [`colors_and_type.css`](colors_and_type.css). |
| Core screens | `app/splash.tsx`, `app/(auth)/{login,register}.tsx`, `app/(tabs)/{index,explore,plans,profile}.tsx` | Five tabs + auth + splash. |
| Components | `components/ui/{PrimaryButton,FormInput,LoadingScreen}.tsx`, `components/AccessAnyGym.tsx` | Few shared components — most styling is inlined per screen. |
| Domain types | `types/index.ts` | `User`, `Gym` (with `tier: 1\|2\|3`), `Transaction`. |
| Design assets | _none in repo_ | The only PNGs in `assets/images/` are the default Expo placeholder icons (a generic blue chevron). **No real logo, illustration, or photography exists in the codebase.** Logos in this design system are reconstructions of the in-product `<Text>G</Text>` + "UNITYFITNESS" wordmark. |

## Products represented

Just one — the **GymPass member app** (`name: "gympass-member"` in `package.json`). No web, no marketing site, no admin/staff app in the repo. The "gym staff" and "admin" roles in `types/User.role` are referenced but no UI for them exists yet.

---

## Content fundamentals

The app speaks **friendly, second-person, lowercase-confident**. Sentences are short and verb-led. Microcopy reads like a fitness app talking to a member, not a SaaS dashboard. Examples lifted from the codebase:

- **Greeting** — `Hey {firstName} 👋` (home hero)
- **Headline** — `Get all-in-one\naccess.` (line break baked in for cadence)
- **Body** — `Explore clubs, take classes, GymPass with one subscription.` _(verb-as-noun "GymPass" is a real example of the brand voice; it's used playfully)_
- **CTA labels** — `Explore Clubs Near You`, `Buy now`, `See all plans`, `Discover our partners`, `Generate New Pass`, `Create Account`
- **Banner copy** — `Discover our plans` / `Buy points once · Use them everywhere`
- **Auth taglines** — `Welcome back !`, `Log In to go forward`, `Create your account`
- **Empty states / errors** — `No account found with this email.`, `Incorrect password. Please try again.`, `This account is linked to a different device.`
- **Security copy** — `End-to-end secured · One-time use · Auto-expires`, `Rotates every 10s to prevent sharing`

**Casing**: Title Case for buttons and section headers (`Find Club`, `My Address`, `Schedule a Class`). UPPERCASE with extra tracking for two specific places only — the `UNITYFITNESS` wordmark in the home header (3px tracking) and the small section labels in profile (`GENERAL`, `MY CLUB` — 0.8px tracking). Form input labels are uppercase + tracked too (`EMAIL`, `PASSWORD`).

**Person**: second person (`you`, `your`), never first. The app addresses the member directly.

**Punctuation quirks** — middots `·` separate metadata (`25 pts · 7.96 MAD/pt`, `End-to-end secured · One-time use`). The bullet is the brand's preferred separator; never `|`, never an em dash.

**Currency**: MAD, written after the number with no space-comma-decimal preference (`99 MAD`, `7.96 MAD/pt`).

**Emoji**: used **sparingly** and only to humanise. We see `👋` in the greeting, `🙈 / 👁️` as toggle icons in password fields, `⚠️` on urgent countdowns, `🔒` on secure states, and `♥` in the version footer (`Made with ♥ in Morocco`). Emoji are decoration, never load-bearing — every emoji line still has an Ionicon equivalent doing the real work.

**Vibe**: confident, tactile, a touch warm. Not corporate. The product doesn't lecture about wellness or mindset — it talks about access, points, and the next club.

---

## Visual foundations

### Palette

The brand runs on **two colors plus a near-white**. Lavender `#9f99c7` is the soft, friendly primary; deep burgundy `#3C0008` is the serious, confident accent. They appear together on every meaningful surface. The background is an off-white tinted toward lavender (`#F7F6FB`) — **never pure white at full screen** — which lets cards, surfaces and the lavender hero blend without blowing out.

- **Primary use** — Lavender for hero panels, avatar cards, the home greeting card, focus borders, soft chips. Lavender at 15% (`primaryMuted`) for tinted backgrounds (CTA cards, security badges, active tab pills).
- **Accent use** — Burgundy for the auth header strip, primary CTAs, the QR code itself, tier-3 markers, the active tab icon, the popular-plan badge. Used wherever the user must commit (`Sign In`, `Buy now`, `Check in here`).
- **Burgundy at 12%** (`accentMuted`) — backgrounds for stat-card icons and small accent chips.
- **Tier colors** — Tier 1 = primary lavender, Tier 2 = warning amber `#F59E0B`, Tier 3 = burgundy. This is a content system, not a free palette: don't pick another color for "tier 4".
- **Semantic** — error `#D93025` on `#FFE9E8`, success `#1E8A4C`, warning `#F59E0B`. Errors get their own error-bg pill behind row icons (`signOutBtn`).

### Type

System font in the codebase (`FONTS = { display: "System", body: "System" }`). For HTML output we substitute **Inter** from Google Fonts (flagged below). The scale is small at the bottom (11–17 for UI chrome) and jumps to 24/30/40 for hero moments. Only **two extreme weights** carry any work: 400 (regular body), 500 (medium meta), 600 (semibold labels), 700 (bold buttons), and 900 (black headlines + the wordmark). Avoid weights between — the brand reads as either calm-body or shouty-display, never in between.

### Spacing & rhythm

A strict 4px grid: `4, 8, 16, 24, 32, 48, 64`. Card padding is almost always `lg=24` or `xl=32` for hero surfaces. Sections inside cards stack on `sm=8` or `md=16`. Stat cards and pill rows use `sm=8` gaps; vertical rhythm between cards is `lg=24`.

### Radii

Distinctive, generous, and graduated: `8 / 14 / 22 / 32 / full`. Inputs and small surfaces use 14, cards use 22, **hero containers use 32** (the home hero, the avatar card, the bottom-sheet top corners, the auth panel's top radius). Buttons are *always* `full` (pill) — there are no square or 8px-radius buttons. The 32px hero radius is a brand signature.

### Shadows

Two systems, both soft:
- **`SHADOWS.card`** — lavender-tinted: `0 4px 12px rgba(159,153,199,0.18)`. Used for the hero card, popular plan card, sticky purchase bar, QR card. Lavender shadows on lavender surfaces are intentional — they read as a halo, not a drop.
- **`SHADOWS.soft`** — neutral black at 8%, 8px blur. The default for stat cards, pills, plan cards. Quiet.
- No shadow on full-bleed panels (auth header, tab bar). Borders do that work instead.

### Cards

The default card pattern: white surface, `1px` border in `#D8D6EE`, radius 14 or 22, `SHADOWS.soft`, padding 16–24. Selected/popular state replaces the border with a colored 2px border (`primary` or `accent`) and swaps to `SHADOWS.card`. **There are no left-border-accent cards** anywhere in the codebase — avoid that motif entirely.

### Hero surfaces

The home hero, avatar card, and login top-section all share the same recipe: solid color (lavender for hero/avatar; burgundy for auth), radius 32, padding 32, plus a **decorative blob** — a 160×160 circle of accent-at-15%-opacity, positioned `top: -40, right: -40` so it bleeds out of the corner. This blob is a recurring brand pattern. Reuse it; don't reinvent it.

### Backgrounds & full-bleed

No photography in the app. No illustrations. No gradients except a single splash `bgShift` that loops between `#F7F6FB` and `#1a1a2e` over 4s and a `glowTop` lavender + `glowBottom` burgundy soft circle on splash. **No repeating patterns or textures.** Backgrounds are flat color + the occasional decorative blob.

### Borders & dividers

`1px solid #D8D6EE` (lavender-tinted border) is the universal divider. Inputs use `1.5px` so focus is visible. Profile section dividers are inset to align under the row label, not the icon (a small but consistent detail).

### Icon containers

Wherever an icon meets text, the icon sits in a **rounded square or circle** with a tinted background:
- Stat-card icons: 36×36 circle, `accentMuted` background, accent-colored glyph.
- Profile-row icons: 34×34, radius 8, `accentMuted` background, accent glyph.
- Hero arrow chip: 36×36 circle, white-at-13% on the burgundy arrow CTA.
- QR security badge: full-radius pill, `primaryMuted` background.

This icon-in-tinted-square is the brand's primary "iconographic affordance".

### Animation & motion

- **Easing** — `Easing.out(Easing.cubic)` for entrance, `Easing.inOut(Easing.ease)` for loops, `Easing.linear` for shimmers. No springs except button press (`Animated.spring({toValue:0.96, speed:50})`).
- **Durations** — entrance `600ms`, fade `300ms`, button press settle `~150ms`.
- **Press states** — primary buttons scale to **0.96** on press (spring); pills/touchables use `activeOpacity={0.7–0.85}`. The whole app prefers opacity-down over color-down for press.
- **Loops** — the home "Discover our plans" banner has a **2.5s cross-card shimmer** (a 80px-wide white-at-9% rectangle skewed -20° sweeping left to right) and a **1.4s arrow pulse** (1 → 1.25 → 1 scale). The QR card pulses 1.04× and turns red border at ≤3s remaining. Loops are a recurring tool — use them on cards that need to feel "live", not on chrome.
- **No bouncy overshoots, no parallax, no fancy stagger.** Calm, declarative motion.

### Hover / press / disabled

- Hover (web only) — same as press: opacity 0.85 or 0.7.
- Press — `activeOpacity` 0.85 for primary, 0.75 for pills, 0.7 for low-emphasis links.
- Disabled — `opacity: 0.45` for full buttons, `opacity: 0.5` for muted pills. **Disabled does not change color**, only opacity. The component still "looks" the same.

### Focus

`borderFocus = #9f99c7` — input borders go from `#D8D6EE` to lavender on focus, with `selectionColor={COLORS.accent}`. So you type in burgundy inside a lavender-bordered input. This pairing is unique and worth preserving.

### Transparency & blur

Used on overlays only:
- Modal backdrop: `#00000060` (37% black). No backdrop-blur.
- Expired-QR overlay: `accent + "F0"` (94% burgundy) on top of the live QR.
- Banner shimmer: `#FFFFFF18` (~9% white).
- "Tagline" text on burgundy auth header: `rgba(255,255,255,0.75)`.
- The hero blob: `accent` at `opacity: 0.15`.

There is **no glassmorphism, no backdrop-filter blur** anywhere. Transparency is purely color-mixing.

### Imagery vibe

If real photography is added later, treat it as **warm, grain-friendly, candid**. The auth panel and home hero are very strong color blocks; photography should sit *inside* a card, never full-bleed under a card. The brand has not published an image direction; flagged for the user.

### Layout rules (fixed elements)

- Tab bar: `tabBar` background, `1px` top border, `58 + insets.bottom` tall. Icons sit inside a 36×36 capsule that fills with `primaryMuted` when active.
- Page header: white surface, `1px` bottom border, `lg`/`md` padding, h-stacked title + subtitle.
- Sticky purchase bar (Plans tab): white, `1px` top border, `card` shadow, contains label+price on left, accent pill button on right.
- Bottom sheet (selected gym): top-radius 32, `lg` padding, 40×4 grey "handle" centered, fades up from below.

---

## Iconography

### Source

The codebase uses **`@expo/vector-icons` → Ionicons** exclusively. Every icon in the app is a `<Ionicons name="…" size={…} color={…} />`. There is no custom icon font, no SVG sprite, no PNG icon set, no Font Awesome, no Material Icons.

For HTML/web output, we substitute **[Lucide](https://lucide.dev/) via CDN** — an open-source set with the same outline-first / round-cap style as Ionicons-outline. Closest visual matches are documented in [`ICONS.md`](ICONS.md). **This is a substitution; flag it to the user.**

### Style

- **Outline by default**, filled when active (the tabs swap `home-outline` ↔ `home`, `map-outline` ↔ `map`, etc).
- 2px-equivalent stroke. Round caps and joins.
- Geometric, not hand-drawn.
- **Icons sit inside a tinted container** (see Visual Foundations → Icon containers). Never floating at the same color as the text on a plain background.

### Sizes (in code)

`14` (small inline), `16` (chevrons, perks list), `18` (action pills, sign-out), `20` (stat cards, hero arrow), `22` (modal close), `24` (tab icons), `28+` (CTA cards).

### Common icons in use

`home`, `map`, `flash`, `person`, `qr-code`, `barbell-outline`, `location-outline`, `wallet-outline`, `compass`, `arrow-forward`, `chevron-forward`, `chevron-down`, `lock-closed`, `shield-checkmark`, `refresh`, `checkmark-circle`, `add-circle-outline`, `time-outline`, `gift-outline`, `moon-outline`, `language-outline`, `settings-outline`, `cog-outline`, `help-circle-outline`, `log-out-outline`, `create-outline`, `storefront-outline`.

### Emoji

Used as decoration only, never as the primary icon for a function. Allowed: `👋 🙈 👁️ ⚠️ 🔒 ♥`. **Anything else should be checked.**

### Logos

The codebase **does not contain** a real logo file — `assets/images/icon.png` is the default Expo blue chevron. The in-product logo is composed at runtime: a 32×32 burgundy rounded-square with a white `G` glyph, set next to the wordmark `UNITYFITNESS` in 17px black + 3px letter-spacing. Files in `assets/` here ([`logo-mark.svg`](assets/logo-mark.svg), [`logo-mark-knockout.svg`](assets/logo-mark-knockout.svg), [`logo-wordmark.svg`](assets/logo-wordmark.svg)) reconstruct that composition. **Flagged: ask the user for a real logo.**

---

## Substitutions flagged to the user

These are placeholders from "the closest acceptable thing on a CDN". Please replace or confirm:

1. **Font** — `System` → **Inter** (Google Fonts). Closest neutral grotesk to the iOS/Android system stack. If you have a real brand font (Söhne, Helvetica Now, GT Walsheim are all plausible matches), drop the `.woff2` files into `fonts/` and update `--uf-font-display` / `--uf-font-body` in [`colors_and_type.css`](colors_and_type.css).
2. **Icons** — Ionicons → **Lucide** for HTML. Native code keeps Ionicons. Cross-product, the outline style + round caps line up well; a few specific glyphs differ (mapped in [`ICONS.md`](ICONS.md)).
3. **Logo** — Reconstructed from the in-product `<View>+G+wordmark` composition. No real logo file shipped with the codebase. Ask the user.
4. **Photography & illustration** — None exists. Cards and hero surfaces are flat color today.

---

## Index

| File | Purpose |
|---|---|
| `README.md` | This document. |
| `SKILL.md` | Skill manifest for use as a Claude Skill. |
| `colors_and_type.css` | All design tokens as CSS vars + semantic typography classes. |
| `ICONS.md` | Ionicon → Lucide mapping table for HTML output. |
| `assets/logo-mark.svg` | 80×80 burgundy logomark (G glyph). |
| `assets/logo-mark-knockout.svg` | Reverse logomark on lavender bg. |
| `assets/logo-wordmark.svg` | Mark + UNITYFITNESS lockup. |
| `preview/*.html` | Per-token cards rendered in the Design System tab. |
| `ui_kits/mobile-app/` | High-fidelity recreation of the Expo app — components + interactive index. |
