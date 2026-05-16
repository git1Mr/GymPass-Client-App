// app/checkout.tsx
// Purchase checkout screen — push from Plans with the selected plan ID.
//
// Navigate to: router.push({ pathname: "/checkout", params: { planId: "mobility" } })

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GradientSurface from "@/components/ui/GradientSurface";
import {
    COLORS,
    FONT_SIZES,
    FONT_WEIGHTS,
    RADIUS,
    SHADOWS,
    SPACING,
} from "@/constants/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// ── Plan data (mirrors plans.tsx) ──────────────────────────────────────────
const PLANS: Record<
  string,
  { name: string; price: number; points: number; perPoint: number }
> = {
  starter: { name: "Starter", price: 99, points: 10, perPoint: 9.9 },
  mobility: { name: "Mobility", price: 199, points: 25, perPoint: 7.96 },
  elite: { name: "Elite", price: 349, points: 50, perPoint: 6.98 },
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
    label: "Credit / Debit Card",
    sub: "Visa, Mastercard",
    icon: "card-outline",
  },
  {
    id: "cmi",
    label: "CMI Online",
    sub: "Interbank payment",
    icon: "globe-outline",
  },
  {
    id: "cash",
    label: "Cash on site",
    sub: "Pay at the front desk",
    icon: "cash-outline",
  },
];

// ── Screen ─────────────────────────────────────────────────────────────────
export default function CheckoutScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const plan = PLANS[planId ?? ""] ?? PLANS.mobility;
  const [payMethod, setPayMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  const fees = Math.round(plan.price * 0.025);
  const total = plan.price + fees;

  async function handlePay() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    // TODO: call purchaseService.buyPlan(plan, payMethod)
    // For now just go back to tabs
    router.replace("/(tabs)");
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
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
            <Text style={styles.planLabel}>YOUR PLAN</Text>
            <Text style={styles.planName}>{plan.name}</Text>

            <View style={styles.planRow}>
              <View style={styles.planStat}>
                <Ionicons name="flash" size={16} color="rgba(255,255,255,0.85)" />
                <Text style={styles.planStatText}>{plan.points} points</Text>
              </View>
              <View style={styles.planStat}>
                <Ionicons name="pricetag-outline" size={16} color="rgba(255,255,255,0.85)" />
                <Text style={styles.planStatText}>
                  {plan.perPoint.toFixed(2)} MAD/pt
                </Text>
              </View>
            </View>

            <Text style={styles.planPrice}>{plan.price} MAD</Text>
          </View>
        </GradientSurface>

        {/* ── Payment method ── */}
        <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
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
        <Text style={styles.sectionLabel}>ORDER SUMMARY</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>{plan.name} plan</Text>
            <Text style={styles.summaryVal}>{plan.price} MAD</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Processing fee (2.5%)</Text>
            <Text style={styles.summaryVal}>{fees} MAD</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalKey}>Total</Text>
            <Text style={styles.totalVal}>{total} MAD</Text>
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
            {loading ? "Processing…" : `Pay ${total} MAD`}
          </Text>
          {!loading && (
            <Ionicons name="lock-closed" size={16} color={COLORS.white} />
          )}
        </TouchableOpacity>
        <Text style={styles.secureNote}>
          🔒 Payments are 256-bit encrypted
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.black,
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
    fontWeight: FONT_WEIGHTS.bold,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  planName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.black,
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
    fontWeight: FONT_WEIGHTS.semibold,
  },
  planPrice: {
    fontSize: FONT_SIZES.xxl + 4,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
    letterSpacing: -1,
  },

  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
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
    fontWeight: FONT_WEIGHTS.semibold,
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
    fontWeight: FONT_WEIGHTS.medium,
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
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  totalVal: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.black,
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
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  payBtnLoading: { opacity: 0.7 },
  payBtnText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.base,
  },
  secureNote: {
    textAlign: "center",
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
});
