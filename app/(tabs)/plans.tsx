// app/(tabs)/plans.tsx
// Clean plans screen showing the 3 tiers + a "Discover our plans" CTA.

import {
    COLORS,
    FONT_SIZES,
    FONT_WEIGHTS,
    RADIUS,
    SHADOWS,
    SPACING,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
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
  color: string;
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
    color: COLORS.primary,
    popular: false,
    description: "Perfect for occasional visits to standard gyms.",
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
    color: COLORS.accent,
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
    color: "#1A1728",
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
      style={[
        styles.card,
        selected && styles.cardSelected,
        { borderColor: selected ? plan.color : COLORS.border },
      ]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      {plan.popular && (
        <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDesc}>{plan.description}</Text>
        </View>
        <View
          style={[styles.priceWrap, { backgroundColor: plan.color + "18" }]}
        >
          <Text style={[styles.priceAmount, { color: plan.color }]}>
            {plan.price}
          </Text>
          <Text style={[styles.priceCurrency, { color: plan.color }]}>MAD</Text>
        </View>
      </View>

      <View style={styles.pointsRow}>
        <Ionicons name="flash" size={14} color={plan.color} />
        <Text style={styles.pointsText}>
          {plan.points} pts · {plan.perPoint.toFixed(2)} MAD/pt
        </Text>
      </View>

      <View style={styles.perksList}>
        {plan.perks.map((p) => (
          <View key={p} style={styles.perkRow}>
            <Ionicons name="checkmark-circle" size={16} color={plan.color} />
            <Text style={styles.perkText}>{p}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function PlansScreen() {
  const [selected, setSelected] = useState<string>("mobility");

  const selectedPlan = PLANS.find((p) => p.id === selected)!;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plans</Text>
        <Text style={styles.headerSub}>Choose your mobility pack</Text>
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

        {/* Discover CTA */}
        <View style={styles.ctaCard}>
          <Ionicons
            name="storefront-outline"
            size={28}
            color={COLORS.primary}
            style={{ marginBottom: SPACING.sm }}
          />
          <Text style={styles.ctaTitle}>Discover our plans</Text>
          <Text style={styles.ctaBody}>
            Not sure which pack to pick? See all our offers and compare benefits
            side by side.
          </Text>
          <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
            <Text style={styles.ctaBtnText}>See all plans</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
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
        <TouchableOpacity style={styles.purchaseBtn} activeOpacity={0.85}>
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

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
    overflow: "visible",
  },
  cardSelected: { ...SHADOWS.card },

  popularBadge: {
    position: "absolute",
    top: -12,
    right: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  popularText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  planName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
  },
  planDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
    maxWidth: 180,
  },

  priceWrap: {
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
    minWidth: 64,
  },
  priceAmount: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.black },
  priceCurrency: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.medium },

  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  pointsText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },

  perksList: { gap: SPACING.xs },
  perkRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  perkText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },

  ctaCard: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: "center",
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ctaTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  ctaBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
  },
  ctaBtnText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.base,
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
