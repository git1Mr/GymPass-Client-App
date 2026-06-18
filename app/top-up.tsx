// TopUpScreen — buy UnityFitnessCredits via Stripe Payment Sheet.
//
// Flow:
//   1. User selects (or types) a MAD amount.
//   2. We POST /api/payments/create-intent → backend returns clientSecret,
//      ephemeralKey, customer, publishableKey, merchantName, points.
//   3. initPaymentSheet(...) with the brand `appearance` from theme.ts so the
//      sheet's primary button + merchant name match UnityFitness.
//   4. presentPaymentSheet() — the sheet collects card number, expiry, CVC.
//      Stripe enforces CVC + expiry + 3DS where required (PCI-DSS scope is
//      the Stripe SDK's — card data never touches our servers).
//   5. On success, the webhook (server-side) writes the CREDIT row + bumps
//      balance. The screen just navigates back to the credit dashboard.

import AuroraBackground from "@/components/ui/AuroraBackground";
import GradientSurface from "@/components/ui/GradientSurface";
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    RADIUS,
    SHADOWS,
    SPACING,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import {
    CreateIntentResponse,
    createPaymentIntent,
} from "@/services/paymentsService";
import { isStripeAvailable } from "@/services/stripeEnv";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const PRESETS: { mad: number; label: string }[] = [
  { mad: 50, label: "Quick" },
  { mad: 100, label: "Popular" },
  { mad: 200, label: "Best Value" },
  { mad: 500, label: "Power" },
];

// Resolved at module load. In Expo Go this stays null and the screen renders
// a "needs Dev Build" hint instead of crashing on a missing TurboModule.
const paymentSheetModule: {
  usePaymentSheet: () => {
    initPaymentSheet: (opts: any) => Promise<{ error?: { message: string } }>;
    presentPaymentSheet: () => Promise<{
      error?: { message: string; code?: string };
    }>;
  };
} | null = isStripeAvailable ? require("@stripe/stripe-react-native") : null;

export default function TopUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const sheet = paymentSheetModule?.usePaymentSheet();
  const initPaymentSheet = sheet?.initPaymentSheet;
  const presentPaymentSheet = sheet?.presentPaymentSheet;

  const [selectedMad, setSelectedMad] = useState<number>(100);
  const [customMad, setCustomMad] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  const finalAmount = useMemo<number>(() => {
    if (customMad.trim().length > 0) {
      const n = parseInt(customMad, 10);
      return Number.isFinite(n) && n > 0 ? n : 0;
    }
    return selectedMad;
  }, [customMad, selectedMad]);

  const creditsPreview = finalAmount; // 1 MAD = 1 credit, matches backend rule

  const handleTopUp = useCallback(async () => {
    if (!initPaymentSheet || !presentPaymentSheet) {
      Alert.alert(
        "Payments unavailable in Expo Go",
        "Stripe Payment Sheet uses a native module that Expo Go can't load. " +
          "Run a Dev Build:\n\n" +
          "  npx expo prebuild\n" +
          "  npx expo run:android   (or run:ios)",
      );
      return;
    }
    if (finalAmount < 1) {
      Alert.alert("Invalid amount", "Please enter at least 1 MAD.");
      return;
    }

    setBusy(true);
    try {
      const intent: CreateIntentResponse =
        await createPaymentIntent(finalAmount);

      const initRes = await initPaymentSheet({
        merchantDisplayName: intent.merchantName || "UnityFitness",
        customerId: intent.customer,
        customerEphemeralKeySecret: intent.ephemeralKey,
        paymentIntentClientSecret: intent.clientSecret,
        // Themed sheet — primary button + accents pulled from theme.ts.
        // Stripe still enforces card number / expiry / CVC inside the sheet;
        // we never touch raw card details.
        appearance: {
          colors: {
            primary: COLORS.accent,
            background: COLORS.surface,
            componentBackground: COLORS.surfaceElevated,
            componentBorder: COLORS.border,
            componentDivider: COLORS.border,
            primaryText: COLORS.text,
            secondaryText: COLORS.textSecondary,
            componentText: COLORS.text,
            placeholderText: COLORS.textMuted,
            icon: COLORS.primary,
            error: COLORS.error,
          },
          shapes: {
            borderRadius: RADIUS.md,
            borderWidth: 1,
          },
          primaryButton: {
            colors: {
              background: COLORS.accent,
              text: COLORS.white,
              border: COLORS.accent,
            },
            shapes: { borderRadius: RADIUS.full },
          },
        },
        defaultBillingDetails: {
          name: user?.name,
          email: user?.email,
        },
        allowsDelayedPaymentMethods: false,
        returnURL: "unityfitness://stripe-redirect",
      });

      if (initRes.error) {
        throw new Error(initRes.error.message);
      }

      const present = await presentPaymentSheet();
      if (present.error) {
        if (present.error.code === "Canceled") {
          // User dismissed — no toast.
          return;
        }
        throw new Error(present.error.message);
      }

      Toast.show({
        type: "success",
        text1: "Payment confirmed",
        text2: `${intent.points} UnityFitnessCredits added.`,
      });
      // Webhook usually lands within ~1s; poll twice in case Stripe is slow.
      await refreshUser();
      setTimeout(() => {
        refreshUser();
      }, 1500);
      router.replace("/credits");
    } catch (err: any) {
      Alert.alert("Payment failed", err?.message || "Please try again.");
    } finally {
      setBusy(false);
    }
  }, [finalAmount, initPaymentSheet, presentPaymentSheet, router, user]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header */}
      <AuroraBackground />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Up Credits</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!isStripeAvailable && (
            <View style={styles.expoGoBanner}>
              <Ionicons name="warning" size={18} color={COLORS.warning} />
              <Text style={styles.expoGoText}>
                You&apos;re in Expo Go — Stripe Payment Sheet needs a Dev Build
                to run. The rest of the app works fine here.
              </Text>
            </View>
          )}

          {/* Hero */}
          <GradientSurface radius={RADIUS.xl} style={styles.hero} dimmer={0.08}>
            <View style={styles.heroBody}>
              <Text style={styles.heroLabel}>UNITYFITNESS CREDITS</Text>
              <Text style={styles.heroValue}>
                {creditsPreview}
                <Text style={styles.heroValueUnit}> credits</Text>
              </Text>
              <Text style={styles.heroSub}>
                {finalAmount > 0
                  ? `You'll pay ${finalAmount} MAD`
                  : "Pick an amount below"}
              </Text>
            </View>
          </GradientSurface>

          {/* Presets */}
          <Text style={styles.sectionLabel}>QUICK AMOUNTS</Text>
          <View style={styles.presetGrid}>
            {PRESETS.map((p) => {
              const active = customMad.length === 0 && selectedMad === p.mad;
              return (
                <TouchableOpacity
                  key={p.mad}
                  style={[styles.preset, active && styles.presetActive]}
                  onPress={() => {
                    setSelectedMad(p.mad);
                    setCustomMad("");
                  }}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.presetMad,
                      active && styles.presetTextActive,
                    ]}
                  >
                    {p.mad} MAD
                  </Text>
                  <Text
                    style={[
                      styles.presetLabel,
                      active && styles.presetTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom amount */}
          <Text style={styles.sectionLabel}>OR ENTER YOUR OWN</Text>
          <View style={styles.customRow}>
            <TextInput
              value={customMad}
              onChangeText={(v) => setCustomMad(v.replace(/[^0-9]/g, ""))}
              placeholder="0"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              style={styles.customInput}
              maxLength={6}
            />
            <Text style={styles.customSuffix}>MAD</Text>
          </View>

          {/* Security note */}
          <View style={styles.securityCard}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={COLORS.success}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>Secured by Stripe</Text>
              <Text style={styles.securityBody}>
                Card number, expiry date and CVC are entered inside Stripe&apos;s
                PCI-DSS compliant sheet. Unity Fitness never sees your card.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* CTA */}
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, SPACING.md) },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.payBtn,
              (busy || finalAmount < 1) && styles.payBtnDisabled,
            ]}
            onPress={handleTopUp}
            disabled={busy || finalAmount < 1}
            activeOpacity={0.9}
          >
            {busy ? (
              <ActivityIndicator color={COLORS.textOnPrimary} />
            ) : (
              <>
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color={COLORS.textOnPrimary}
                />
                <Text style={styles.payBtnText}>
                  Pay {finalAmount} MAD securely
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // CaFit header: bare background, outlined circle back button, centered title.
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },

  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },

  expoGoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: "rgba(245,158,11,0.10)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.35)",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  expoGoText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    lineHeight: 16,
  },

  hero: { marginBottom: SPACING.xl, ...SHADOWS.pop },
  heroBody: { padding: SPACING.xl },
  heroLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 1.6,
    marginBottom: SPACING.sm,
  },
  heroValue: {
    fontSize: FONT_SIZES.hero,
    fontFamily: FONTS.black,
    color: COLORS.white,
    letterSpacing: -1,
  },
  heroValueUnit: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: "rgba(255,255,255,0.7)",
  },
  heroSub: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.78)",
    marginTop: SPACING.sm,
  },

  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },

  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  preset: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    alignItems: "center",
    ...SHADOWS.soft,
  },
  // Active preset = brand-filled pill card, per the kit's segmented pricing.
  presetActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetMad: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.black,
    color: COLORS.text,
  },
  presetLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semibold,
    color: COLORS.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  presetTextActive: { color: COLORS.textOnPrimary },

  customRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.soft,
  },
  customInput: {
    flex: 1,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.black,
    color: COLORS.text,
    paddingVertical: SPACING.md,
  },
  customSuffix: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },

  securityCard: {
    flexDirection: "row",
    gap: SPACING.sm,
    backgroundColor: "rgba(30,138,76,0.08)",
    borderWidth: 1,
    borderColor: "rgba(30,138,76,0.18)",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "flex-start",
  },
  securityTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  securityBody: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },

  footer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.card,
  },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  payBtnDisabled: { opacity: 0.55 },
  payBtnText: {
    color: COLORS.textOnPrimary,
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZES.base,
  },
});
