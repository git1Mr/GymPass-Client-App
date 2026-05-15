// app/_layout.tsx
//
// Boot sequence:
//   1. Show SplashScreen (animation plays)
//   2. Splash fades out → AuthProvider mounts → reads SecureStore
//   3. While isLoading: show LoadingScreen (prevents flash of wrong route)
//   4. isLoading resolves → AuthGate fires router.replace to correct stack
//
// Why router.replace and not router.push?
//   replace() swaps the current history entry — there is no "previous" screen
//   to go back to. The hardware back button on Android cannot return to Login
//   once authenticated, and vice versa.
//
// Why segments is NOT in the AuthGate useEffect dependencies?
//   Including it causes the effect to re-fire on every navigation event,
//   which creates redirect loops. We only care when token or isLoading changes.

import { Slot, useRouter, useSegments } from "expo-router";
import React, { JSX, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import LoadingScreen from "@/components/ui/LoadingScreen";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import SplashScreen from "./splash";

// ── AuthGate ──────────────────────────────────────────────────────────────────
// Sits inside AuthProvider so it can read context.
// Watches token + isLoading and fires router.replace when either changes.

function AuthGate(): JSX.Element {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect((): void => {
    // Don't redirect while SecureStore is still being read —
    // we don't know the correct destination yet.
    if (isLoading) return;

    const inAuthGroup: boolean = segments[0] === "(auth)";
    const inTabsGroup: boolean = segments[0] === "(tabs)";

    if (!token && !inAuthGroup) {
      // No token and not already on an auth screen → send to login.
      // replace() clears the stack so Back cannot return to a protected screen.
      router.replace("/(auth)/login");
    } else if (token && inAuthGroup) {
      // Token exists but sitting on a login/register screen → send to app.
      // replace() clears the auth stack so Back cannot return to login.
      router.replace("/(tabs)");
    }
    // If token && inTabsGroup, or !token && inAuthGroup — already correct, do nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isLoading]);
  // ↑ Intentionally omitting `segments` and `router` — including them causes
  //   redirect loops. The gate only needs to react to auth state changes.

  // While loading, render nothing visible — LoadingScreen is shown by the
  // parent RootLayout below this component.
  if (isLoading) return <LoadingScreen />;

  // Render the matched route's component
  return <Slot />;
}

// ── Root layout ───────────────────────────────────────────────────────────────

export default function RootLayout(): JSX.Element {
  const [splashDone, setSplashDone] = useState<boolean>(false);

  // Phase 1: play the splash animation before any providers mount.
  // This avoids a flash where provider-dependent screens render partially.
  if (!splashDone) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={(): void => setSplashDone(true)} />
        <Toast />
      </SafeAreaProvider>
    );
  }

  // Phase 2: splash done → mount providers → AuthGate decides the route.
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGate />
        {/* Toast must be outside NavigationContainer to render above all screens */}
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

