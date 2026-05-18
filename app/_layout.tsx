import { Slot, useRouter, useSegments } from "expo-router";
import React, { JSX, useEffect, useState } from "react";
import { AppRegistry, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import LoadingScreen from "@/components/ui/LoadingScreen";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { isStripeAvailable } from "@/services/stripeEnv";
import { ThemeProvider } from "@/theme/ThemeContext";
import SplashScreen from "./splash";

// Register a no-op JS handler for Stripe's Android HeadlessJsTaskService.
// Without it, the SDK logs "No task registered for key StripeKeepJsAwakeTask"
// after every Payment Sheet completion.
if (Platform.OS === "android") {
  AppRegistry.registerHeadlessTask("StripeKeepJsAwakeTask", () => async () => {});
}

const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const STRIPE_MERCHANT_ID =
  process.env.EXPO_PUBLIC_STRIPE_MERCHANT_ID ?? "merchant.unityfitness";

// Lazy require so Expo Go never loads the native module — touching the import
// in Expo Go crashes with TurboModuleRegistry.getEnforcing(...) for 'StripeSdk'.
function MaybeStripeProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  if (!isStripeAvailable) return <>{children}</>;
  const { StripeProvider } = require("@stripe/stripe-react-native");
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier={STRIPE_MERCHANT_ID}
    >
      {children}
    </StripeProvider>
  );
}

function AuthGate(): JSX.Element {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect((): void => {
    if (isLoading) return;

    const inAuthGroup: boolean = segments[0] === "(auth)";
    const inTabsGroup: boolean = segments[0] === "(tabs)";

    if (!token && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (token && inAuthGroup) {
      router.replace("/(tabs)");
    }
    // Omit segments/router from deps — including them causes redirect loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isLoading]);

  if (isLoading) return <LoadingScreen />;
  return <Slot />;
}

export default function RootLayout(): JSX.Element {
  const [splashDone, setSplashDone] = useState<boolean>(false);

  if (!splashDone) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <SplashScreen onFinish={(): void => setSplashDone(true)} />
          <Toast />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MaybeStripeProvider>
          <AuthProvider>
            <AuthGate />
            {/* Toast must be outside NavigationContainer to render above all screens */}
            <Toast />
          </AuthProvider>
        </MaybeStripeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
