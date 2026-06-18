// app/checkout.tsx
// Purchase checkout screen — push from Plans with the selected plan ID.
//
// Navigate to: router.push({ pathname: "/checkout", params: { planId: "mobility" } })

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
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

// Same lazy-require pattern as top-up.tsx so Expo Go doesn't crash on the
// missing native module (only Dev/native builds have StripeSdk linked).
const paymentSheetModule: {
  usePaymentSheet: () => {
    initPaymentSheet: (opts: any) => Promise<{ error?: { message: string } }>;
    presentPaymentSheet: () => Promise<{
      error?: { message: string; code?: string };
    }>;
  };
} | null = isStripeAvailable ? require("@stripe/stripe-react-native") : null;

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// ── Credit packs (mirrors the Explorer packs in plans.tsx) ──────────────────
const PLANS: Record<
  string,
  { name: string; price: number; points: number; perPoint: number }
> = {
  pack5: { name: "5 crédits", price: 60, points: 5, perPoint: 12 },
  pack15: { name: "15 crédits", price: 150, points: 15, perPoint: 10 },
  pack30: { name: "30 crédits", price: 270, points: 30, perPoint: 9 },
};

// ── Payment methods ────────────────────────────────────────────────────────
interface PayMethod {
  id: string;
  label: string;
  sub: string;
  icon: IoniconsName;
}

const PAY_METHODS: PayMethod[] = [
  {
    id: "card",
    label: "Carte bancaire",
    sub: "Visa, Mastercard",
    icon: "card-outline",
  },
  {
    id: "cmi",
    label: "CMI en ligne",
    sub: "Paiement interbancaire",
    icon: "globe-outline",
  },
  {
    id: "cash",
    label: "Espèces sur place",
    sub: "Payer à l'accueil",
    icon: "cash-outline",
  },
];

// ── Screen ─────────────────────────────────────────────────────────────────
export default function CheckoutScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const sheet = paymentSheetModule?.usePaymentSheet();
  const initPaymentSheet = sheet?.initPaymentSheet;
  const presentPaymentSheet = sheet?.presentPaymentSheet;

  const plan = PLANS[planId ?? ""] ?? PLANS.pack15;
  const [payMethod, setPayMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  const fees = Math.round(plan.price * 0.025);
  const total = plan.price + fees;

  async function handlePay() {
    // Cash + CMI are not implemented server-side yet.
    if (payMethod !== "card") {
      Alert.alert(
        "Bientôt disponible",
        `Le paiement ${payMethod === "cash" ? "en espèces sur place" : "CMI en ligne"} n'est pas activé dans cette version.`,
      );
      return;
    }
    if (!initPaymentSheet || !presentPaymentSheet) {
      Alert.alert(
        "Paiements indisponibles dans Expo Go",
        "Le Payment Sheet Stripe utilise un module natif qu'Expo Go ne peut pas charger. " +
          "Utilisez un Dev Build :\n\n  npx expo run:android",
      );
      return;
    }

    setLoading(true);
    try {
      // Server pins points to the plan's value (e.g. 25 pts for 199 MAD) via
      // the new `points` + `label` overrides on /api/payments/create-intent.
      const intent: CreateIntentResponse = await createPaymentIntent(total, {
        points: plan.points,
        label:  plan.name,
      });

      const initRes = await initPaymentSheet({
        merchantDisplayName: intent.merchantName || "UnityFitness",
        customerId: intent.customer,
        customerEphemeralKeySecret: intent.ephemeralKey,
        paymentIntentClientSecret: intent.clientSecret,
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
          shapes: { borderRadius: RADIUS.md, borderWidth: 1 },
          primaryButton: {
            colors: {
              background: COLORS.accent,
              text: COLORS.white,
              border: COLORS.accent,
            },
            shapes: { borderRadius: RADIUS.full },
          },
        },
        defaultBillingDetails: { name: user?.name, email: user?.email },
        allowsDelayedPaymentMethods: false,
        returnURL: "unityfitness://stripe-redirect",
      });
      if (initRes.error) throw new Error(initRes.error.message);

      const present = await presentPaymentSheet();
      if (present.error) {
        if (present.error.code === "Canceled") return;
        throw new Error(present.error.message);
      }

      Toast.show({
        type: "success",
        text1: "Paiement confirmé",
        text2: `${plan.points} crédits ajoutés à votre portefeuille.`,
      });
      // Refresh once immediately, again after the webhook has had time to land.
      await refreshUser();
      setTimeout(() => { refreshUser(); }, 1500);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Échec du paiement", err?.message || "Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AuroraBackground />
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Plan summary card (brand hero gradient) ── */}
        <GradientSurface
          radius={RADIUS.xl}
          style={styles.planCard}
          dimmer={0.08}
        >
          <View style={styles.planBody}>
            <Text style={styles.planLabel}>VOTRE FORMULE</Text>
            <Text style={styles.planName}>{plan.name}</Text>

            <View style={styles.planRow}>
              <View style={styles.planStat}>
                <Ionicons name="flash" size={16} color="rgba(255,255,255,0.85)" />
                <Text style={styles.planStatText}>{plan.points} crédits</Text>
              </View>
              <View style={styles.planStat}>
                <Ionicons name="pricetag-outline" size={16} color="rgba(255,255,255,0.85)" />
                <Text style={styles.planStatText}>
                  {plan.perPoint.toFixed(2)} DH/crédit
                </Text>
              </View>
            </View>

            <Text style={styles.planPrice}>{plan.price} DH</Text>
          </View>
        </GradientSurface>

        {/* ── Payment method ── */}
        <Text style={styles.sectionLabel}>MOYEN DE PAIEMENT</Text>
        <View style={styles.methodList}>
          {PAY_METHODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.methodRow,
                payMethod === m.id && styles.methodRowActive,
              ]}
              onPress={() => setPayMethod(m.id)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.methodIcon,
                  payMethod === m.id && styles.methodIconActive,
                ]}
              >
                <Ionicons
                  name={m.icon}
                  size={18}
                  color={
                    payMethod === m.id ? COLORS.accent : COLORS.textMuted
                  }
                />
              </View>
              <View style={styles.methodText}>
                <Text style={styles.methodLabel}>{m.label}</Text>
                <Text style={styles.methodSub}>{m.sub}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  payMethod === m.id && styles.radioActive,
                ]}
              >
                {payMethod === m.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Price summary ── */}
        <Text style={styles.sectionLabel}>RÉCAPITULATIF</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>{plan.name}</Text>
            <Text style={styles.summaryVal}>{plan.price} DH</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Frais de traitement (2,5 %)</Text>
            <Text style={styles.summaryVal}>{fees} DH</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalKey}>Total</Text>
            <Text style={styles.totalVal}>{total} DH</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Pay button ── */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, SPACING.md) },
        ]}
      >
        <TouchableOpacity
          style={[styles.payBtn, loading && styles.payBtnLoading]}
          onPress={handlePay}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.payBtnText}>
            {loading ? "Traitement…" : `Payer ${total} DH`}
          </Text>
          {!loading && (
            <Ionicons
              name="lock-closed"
              size={16}
              color={COLORS.textOnPrimary}
            />
          )}
        </TouchableOpacity>
        <Text style={styles.secureNote}>
          🔒 Paiements chiffrés en 256 bits
        </Text>
      </View>
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

  planCard: {
    marginBottom: SPACING.xl,
    ...SHADOWS.pop,
  },
  planBody: {
    padding: SPACING.xl,
  },
  planLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  planName: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.black,
    color: COLORS.white,
    marginBottom: SPACING.md,
    letterSpacing: -0.5,
  },
  planRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  planStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  planStatText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semibold,
  },
  planPrice: {
    fontSize: FONT_SIZES.xxl + 4,
    fontFamily: FONTS.black,
    color: COLORS.white,
    letterSpacing: -1,
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

  methodList: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: SPACING.lg,
    ...SHADOWS.soft,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  methodRowActive: {
    backgroundColor: COLORS.accentMuted,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  methodIconActive: {
    backgroundColor: COLORS.accentMuted,
  },
  methodText: { flex: 1 },
  methodLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  methodSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 1 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: COLORS.accent },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },

  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.xs,
  },
  summaryKey: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  summaryVal: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
  },
  totalKey: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  totalVal: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.black,
    color: COLORS.accent,
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
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  payBtnLoading: { opacity: 0.7 },
  payBtnText: {
    color: COLORS.textOnPrimary,
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZES.base,
  },
  secureNote: {
    textAlign: "center",
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
});
