import AccessAnyGym from "@/components/AccessAnyGym";
import AuroraBackground from "@/components/ui/AuroraBackground";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import GradientFill from "@/components/ui/GradientFill";
import GradientText from "@/components/ui/GradientText";
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    GRADIENTS,
    RADIUS,
    SPACING,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// Tier accent colors echo the landing's per-plan accents.
const TIER_TINT: Record<number, string> = {
  1: COLORS.success,
  2: COLORS.primaryLight,
  3: COLORS.magenta,
};

const NEARBY = [
  { id: "1", name: "FitClub Casablanca", city: "Casablanca", tier: 2, pts: 3 },
  { id: "2", name: "EliteGym Rabat", city: "Rabat", tier: 3, pts: 5 },
  { id: "3", name: "Standard Fit Tangier", city: "Tangier", tier: 1, pts: 1 },
  { id: "4", name: "SportHub Marrakech", city: "Marrakech", tier: 1, pts: 2 },
];

const STEPS: { icon: IoniconsName; title: string; body: string }[] = [
  { icon: "wallet-outline", title: "Achetez des crédits", body: "Rechargez une fois — sans engagement mensuel." },
  { icon: "location-outline", title: "Trouvez un club", body: "Choisissez n'importe quel club du réseau." },
  { icon: "qr-code-outline", title: "Scannez & entraînez-vous", body: "Présentez votre QR code à l'accueil." },
];

// ── Compact stat tile ──────────────────────────────────────────────────────
function StatTile({
  label,
  value,
  unit,
  icon,
  tint,
  onPress,
}: {
  label: string;
  value: string;
  unit: string;
  icon: IoniconsName;
  tint: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.statTileWrap} onPress={onPress} activeOpacity={0.85}>
      <GlassCard style={styles.statTile}>
        <View style={[styles.statIcon, { backgroundColor: tint + "26", borderColor: tint + "55" }]}>
          <Ionicons name={icon} size={18} color={tint} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </GlassCard>
    </TouchableOpacity>
  );
}

// ── Quick-action tile ───────────────────────────────────────────────────────
function ActionTile({
  icon,
  label,
  onPress,
}: {
  icon: IoniconsName;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionTileWrap} onPress={onPress} activeOpacity={0.85}>
      <GlassCard style={styles.actionTile}>
        <View style={styles.actionIcon}>
          <GradientFill colors={GRADIENTS.primary} />
          <Ionicons name={icon} size={22} color={COLORS.textOnPrimary} />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
      </GlassCard>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const username = user?.name?.split(" ")[0] ?? "there";
  const credits = user?.pointsBalance ?? 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser]);

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primaryLight}
              colors={[COLORS.primary]}
            />
          }
        >
          {/* ── Header: avatar + greeting · notifications ── */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => router.push("/(tabs)/profile")}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
            >
              <View style={styles.avatarRing}>
                <GradientFill colors={GRADIENTS.primary} />
                <Ionicons name="person" size={22} color={COLORS.textOnPrimary} />
              </View>
              <View style={styles.statusDot} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerHello}>Bon retour</Text>
              <Text style={styles.headerName} numberOfLines={1}>
                {username}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => router.push("/notifications")}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>

          {/* ── Balance hero ── */}
          <GlassCard highlighted style={styles.hero}>
            <Eyebrow>Votre portefeuille</Eyebrow>
            <View style={styles.heroValueRow}>
              <GradientText colors={[...GRADIENTS.text]} style={styles.heroValue}>
                {String(credits)}
              </GradientText>
              <Text style={styles.heroUnit}>crédits</Text>
            </View>
            <Text style={styles.heroSub}>
              Utilisez-les dans tous les clubs du réseau.
            </Text>

            <View style={styles.heroBtnRow}>
              <TouchableOpacity
                style={styles.heroPrimary}
                onPress={() => router.push("/top-up")}
                activeOpacity={0.9}
              >
                <GradientFill colors={GRADIENTS.primary} />
                <Ionicons name="add" size={18} color={COLORS.textOnPrimary} />
                <Text style={styles.heroPrimaryText}>Recharger</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroSecondary}
                onPress={() => router.push("/credits")}
                activeOpacity={0.85}
              >
                <Text style={styles.heroSecondaryText}>Mon portefeuille</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* ── Primary action: check in ── */}
          <View style={styles.checkInWrap}>
            <AccessAnyGym variant="full" />
          </View>

          {/* ── Quick stats ── */}
          <View style={styles.statsRow}>
            <StatTile
              label="Entrées"
              value="—"
              unit="ce mois-ci"
              icon="checkmark-circle-outline"
              tint={COLORS.primaryLight}
              onPress={() => router.push("/check-in-history")}
            />
            <StatTile
              label="Clubs partenaires"
              value="12+"
              unit="près de vous"
              icon="location-outline"
              tint={COLORS.magenta}
              onPress={() => router.push("/(tabs)/explore")}
            />
          </View>

          {/* ── Clubs near you ── */}
          <View style={styles.sectionHead}>
            <View>
              <Eyebrow>Découvrir</Eyebrow>
              <Text style={styles.sectionTitle}>Clubs près de vous</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/explore")} activeOpacity={0.7}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.railContent}
            style={styles.rail}
          >
            {NEARBY.map((gym) => (
              <TouchableOpacity
                key={gym.id}
                activeOpacity={0.88}
                onPress={() => router.push({ pathname: "/gym/[id]", params: { id: gym.id } })}
              >
                <GlassCard style={styles.clubCard}>
                  <View style={styles.clubTop}>
                    <View style={styles.clubBadge}>
                      <Ionicons name="barbell" size={18} color={COLORS.primaryLight} />
                    </View>
                    <View
                      style={[
                        styles.tierPill,
                        { backgroundColor: TIER_TINT[gym.tier] + "26" },
                      ]}
                    >
                      <Text style={[styles.tierPillText, { color: TIER_TINT[gym.tier] }]}>
                        Palier {gym.tier}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.clubName} numberOfLines={1}>
                    {gym.name}
                  </Text>
                  <View style={styles.clubMetaRow}>
                    <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                    <Text style={styles.clubCity}>{gym.city}</Text>
                  </View>
                  <View style={styles.clubFootRow}>
                    <Ionicons name="flash" size={13} color={COLORS.warning} />
                    <Text style={styles.clubPts}>{gym.pts} crédits / séance</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Quick actions ── */}
          <View style={styles.sectionHead}>
            <View>
              <Eyebrow>Raccourcis</Eyebrow>
              <Text style={styles.sectionTitle}>Actions rapides</Text>
            </View>
          </View>
          <View style={styles.actionsGrid}>
            <ActionTile icon="flash-outline" label="Forfaits" onPress={() => router.push("/(tabs)/plans")} />
            <ActionTile icon="add-circle-outline" label="Recharger" onPress={() => router.push("/top-up")} />
            <ActionTile icon="time-outline" label="Historique" onPress={() => router.push("/check-in-history")} />
            <ActionTile icon="map-outline" label="Explorer" onPress={() => router.push("/(tabs)/explore")} />
          </View>

          {/* ── How it works (friendly for new members) ── */}
          <GlassCard style={styles.howCard}>
            <Eyebrow>Nouveau ici ?</Eyebrow>
            <Text style={styles.howTitle}>Comment fonctionne Unity Fitness</Text>
            {STEPS.map((step, i) => (
              <View key={step.title} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <View style={styles.stepIcon}>
                  <Ionicons name={step.icon} size={18} color={COLORS.primaryLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepBody}>{step.body}</Text>
                </View>
              </View>
            ))}
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  avatarBtn: { position: "relative" },
  avatarRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  headerCenter: { flex: 1 },
  headerHello: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  headerName: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: 1,
    letterSpacing: -0.3,
  },
  bellBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.glass,
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 12,
    right: 13,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.magenta,
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },

  // Balance hero
  hero: {
    padding: SPACING.lg,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
    overflow: "hidden",
  },
  heroValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  heroValue: {
    fontSize: FONT_SIZES.hero + 6,
    fontFamily: FONTS.display,
    letterSpacing: -1.5,
  },
  heroUnit: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    paddingBottom: 8,
  },
  heroSub: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  heroBtnRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  heroPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: RADIUS.full,
    overflow: "hidden",
  },
  heroPrimaryText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semibold,
    color: COLORS.textOnPrimary,
  },
  heroSecondary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.glass,
  },
  heroSecondaryText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },

  checkInWrap: { marginBottom: SPACING.lg },

  // Stats
  statsRow: { flexDirection: "row", gap: SPACING.md, marginBottom: SPACING.xl },
  statTileWrap: { flex: 1 },
  statTile: { padding: SPACING.md },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    marginTop: 2,
  },
  statUnit: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  // Section heads
  sectionHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  seeAll: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.primaryLight,
  },

  // Clubs rail
  rail: { marginHorizontal: -SPACING.lg, marginBottom: SPACING.xl },
  railContent: { paddingHorizontal: SPACING.lg, gap: SPACING.md },
  clubCard: { width: 210, padding: SPACING.md },
  clubTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  clubBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  tierPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  tierPillText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.semibold },
  clubName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  clubMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  clubCity: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textMuted },
  clubFootRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: SPACING.md },
  clubPts: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.medium, color: COLORS.textSecondary },

  // Actions grid
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionTileWrap: { width: "47%", flexGrow: 1 },
  actionTile: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm + 2,
    padding: SPACING.md,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  actionLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },

  // How it works
  howCard: { padding: SPACING.lg },
  howTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.3,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm + 2,
    paddingVertical: SPACING.sm,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    color: COLORS.textOnPrimary,
  },
  stepIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  stepBody: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
