import { DMMono_400Regular, DMMono_500Medium } from "@expo-google-fonts/dm-mono";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/montserrat";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { JSX, useEffect, useState } from "react";
import { AppRegistry, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast, { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";

import LoadingScreen from "@/components/ui/LoadingScreen";
import { COLORS, FONTS, FONT_SIZES, RADIUS } from "@/constants/theme";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { isStripeAvailable } from "@/services/stripeEnv";
import { ThemeProvider } from "@/theme/ThemeContext";
import SplashScreen from "./splash";

// Dark-surface toasts — the library defaults are white cards with dark text.
const toastBase = {
  style: {
    backgroundColor: COLORS.surfaceElevated,
    borderLeftWidth: 4,
    borderRadius: RADIUS.md,
  },
  text1Style: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semibold,
  },
  text2Style: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  text2NumberOfLines: 2,
};
const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast {...props} {...toastBase} style={[toastBase.style, { borderLeftColor: COLORS.success }]} />
  ),
  error: (props) => (
    <ErrorToast {...props} {...toastBase} style={[toastBase.style, { borderLeftColor: COLORS.error }]} />
  ),
  info: (props) => (
    <BaseToast {...props} {...toastBase} style={[toastBase.style, { borderLeftColor: COLORS.primary }]} />
  ),
};

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
  // Montserrat carries the whole type ramp; DM Mono is the eyebrow-label face.
  // Rendering any screen before they resolve would flash system-font fallbacks.
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    DMMono_400Regular,
    DMMono_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar style="light" />
          <LoadingScreen />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  if (!splashDone) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar style="light" />
          <SplashScreen onFinish={(): void => setSplashDone(true)} />
          <Toast config={toastConfig} />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MaybeStripeProvider>
          <AuthProvider>
            <StatusBar style="light" />
            <AuthGate />
            {/* Toast must be outside NavigationContainer to render above all screens */}
            <Toast config={toastConfig} />
          </AuthProvider>
        </MaybeStripeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
