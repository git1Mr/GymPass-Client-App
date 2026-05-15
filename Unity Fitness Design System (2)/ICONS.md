# Ionicons → Lucide map

The native app uses `@expo/vector-icons` → Ionicons. For HTML output we substitute Lucide. This table is the lookup for the icons actually in use in the codebase.

| Ionicons name (RN) | Lucide name (HTML) | Notes |
|---|---|---|
| `home` / `home-outline` | `home` | Same shape. |
| `map` / `map-outline` | `map` | Same. |
| `flash` / `flash-outline` | `zap` | Lucide bolt. |
| `person` / `person-outline` | `user` | |
| `person-circle-outline` | `circle-user` | |
| `qr-code` | `qr-code` | Same. |
| `barbell-outline` | `dumbbell` | Closest. |
| `location` / `location-outline` | `map-pin` | |
| `wallet-outline` | `wallet` | |
| `checkmark-circle` / `checkmark-circle-outline` | `circle-check` / `circle-check-big` | |
| `arrow-forward` | `arrow-right` | |
| `chevron-forward` | `chevron-right` | |
| `chevron-down` / `chevron-up` | `chevron-down` / `chevron-up` | |
| `compass` | `compass` | |
| `lock-closed` | `lock` | |
| `shield-checkmark` / `shield-outline` | `shield-check` / `shield` | |
| `refresh` | `refresh-cw` | |
| `add-circle-outline` | `circle-plus` | |
| `time-outline` | `clock` | |
| `gift-outline` | `gift` | |
| `moon-outline` | `moon` | |
| `language-outline` | `languages` | |
| `settings-outline` / `cog-outline` | `settings` | |
| `help-circle-outline` | `circle-help` | |
| `log-out-outline` | `log-out` | |
| `create-outline` | `pencil` | |
| `storefront-outline` | `store` | |
| `information-circle-outline` / `information-outline` | `info` | |
| `document-text-outline` | `file-text` | |
| `options-outline` | `sliders-horizontal` | |
| `calendar-outline` | `calendar` | |
| `search-outline` | `search` | |
| `close` | `x` | |
| `star-outline` | `star` | |

CDN: `https://unpkg.com/lucide@latest/dist/umd/lucide.js`

Stroke width to match the in-app outline weight: **1.75–2px**. Round caps + round joins.
