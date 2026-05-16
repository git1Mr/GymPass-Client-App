// app/(tabs)/plans.tsx
// Plans screen — each tier card now uses the brand hero treatment
// (GradientSurface: burgundy → lavender diagonal gradient + crosshatch
// texture), mirroring the home-screen hero card.

import GradientSurface from "@/components/ui/GradientSurface";
import {
    COLORS,
    FONT_SIZES,
    FONT_WEIGHTS,
    RADIUS,
    SHADOWS,
    SPACING,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Plan {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  price: number;
  points: number;
  perPoint: number;
  description: string;
  perks: string[];
  popular: boolean;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tier: 1,
    price: 99,
    points: 10,
    perPoint: 9.9,
    popular: false,
    description: "Perfect for occasional visits to standard clubs.",
    perks: [
      "10 points included",
      "Tier 1 gyms (1 pt / session)",
      "Mobile pass",
      "Check-in history",
    ],
  },
  {
    id: "mobility",
    name: "Mobility",
    tier: 2,
    price: 199,
    points: 25,
    perPoint: 7.96,
    popular: true,
    description: "Our most popular pack for regular city-hoppers.",
    perks: [
      "25 points included",
      "Tier 1 & 2 gyms",
      "Priority support",
      "All Starter perks",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    tier: 3,
    price: 349,
    points: 50,
    perPoint: 6.98,
    popular: false,
    description: "Unlimited access across our entire partner network.",
    perks: [
      "50 points included",
      "All Tier 1, 2 & 3 gyms",
      "Dedicated support",
      "Early access to new clubs",
    ],
  },
];

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.cardWrap, selected && styles.cardWrapSelected]}
      onPress={onSelect}
      activeOpacity={0.92}
    >
      <GradientSurface radius={RADIUS.xl} dimmer={selected ? 0 : 0.08}>
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, paddingRight: SPACING.sm }}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planDesc}>{plan.description}</Text>
            </View>
            <View style={styles.priceChip}>
              <Text style={styles.priceAmount}>{plan.price}</Text>
              <Text style={styles.priceCurrency}>MAD</Text>
            </View>
          </View>

          <View style={styles.pointsRow}>
            <Ionicons name="flash" size={14} color="#F59E0B" />
            <Text style={styles.pointsText}>
              {plan.points} pts · {plan.perPoint.toFixed(2)} MAD/pt
            </Text>
          </View>

          <View style={styles.perksList}>
            {plan.perks.map((p) => (
              <View key={p} style={styles.perkRow}>
                <Ionicons
                  name="checkmark"
                  size={14}
                  color="rgba(255,255,255,0.95)"
                />
                <Text style={styles.perkText}>{p}</Text>
              </View>
            ))}
          </View>

          {selected && (
            <View style={styles.selectedPill}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.text} />
              <Text style={styles.selectedPillText}>Selected</Text>
            </View>
          )}
        </View>
      </GradientSurface>
    </TouchableOpacity>
  );
}

export default function PlansScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("mobility");

  const selectedPlan = PLANS.find((p) => p.id === selected)!;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plans</Text>
        <Text style={styles.headerSub}>Buy points once · Use them everywhere</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Buy points once, use them across our entire partner network. No
          monthly commitment.
        </Text>

        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={selected === plan.id}
            onSelect={() => setSelected(plan.id)}
          />
        ))}
      </ScrollView>

      {/* Sticky purchase bar */}
      <View style={styles.purchaseBar}>
        <View>
          <Text style={styles.purchaseLabel}>
            Selected: {selectedPlan.name}
          </Text>
          <Text style={styles.purchasePrice}>
            {selectedPlan.price} MAD · {selectedPlan.points} pts
          </Text>
        </View>
        <TouchableOpacity
          style={styles.purchaseBtn}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: "/checkout",
              params: { planId: selectedPlan.id },
            })
          }
        >
          <Text style={styles.purchaseBtnText}>Buy now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
  },
  headerSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: 2 },

  scroll: { padding: SPACING.lg, paddingBottom: 100 },

  intro: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },

  cardWrap: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.xl,
    shadowColor: "#3C0008",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 28,
    elevation: 6,
  },
  cardWrapSelected: {
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 10,
  },

  cardBody: {
    padding: SPACING.lg,
  },

  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: RADIUS.md,
    zIndex: 2,
  },
  popularText: {
    color: "#3C0008",
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.black,
    letterSpacing: 0.6,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  planName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
    letterSpacing: -0.4,
  },
  planDesc: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 220,
  },

  priceChip: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 70,
  },
  priceAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
    lineHeight: FONT_SIZES.xl,
  },
  priceCurrency: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: "rgba(255,255,255,0.85)",
    marginTop: 3,
    letterSpacing: 1,
  },

  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: SPACING.md,
    alignSelf: "flex-start",
    backgroundColor: "rgba(245,158,11,0.18)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.35)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  pointsText: {
    fontSize: FONT_SIZES.sm,
    color: "#FFE3AE",
    fontWeight: FONT_WEIGHTS.bold,
  },

  perksList: { gap: 6 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  perkText: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.92)",
  },

  selectedPill: {
    marginTop: SPACING.md,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  selectedPillText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.4,
  },

  purchaseBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.card,
  },
  purchaseLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  purchasePrice: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  purchaseBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
  },
  purchaseBtnText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.base,
  },
});
