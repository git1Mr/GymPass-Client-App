// services/stripeEnv.ts
//
// @stripe/stripe-react-native ships a native module (TurboModule) and is NOT
// supported in Expo Go — only in a custom Dev Build / EAS build. Touching its
// exports (e.g. `import { StripeProvider } from '@stripe/stripe-react-native'`)
// from inside Expo Go crashes the JS bundle with:
//   TurboModuleRegistry.getEnforcing(...): 'StripeSdk' could not be found.
//
// This module is the single source of truth for "is Stripe usable right now?"
// so the app can boot in Expo Go (everything except payments works) and only
// the top-up screen gracefully degrades.

import Constants, { ExecutionEnvironment } from "expo-constants";

// `storeClient` = Expo Go; `standalone`/`bare` = native build with Stripe linked.
// `appOwnership === 'expo'` is the legacy check; both are kept for safety.
export const isExpoGo: boolean =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any).appOwnership === "expo";

export const isStripeAvailable: boolean = !isExpoGo;
