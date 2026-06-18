import AuroraBackground from "@/components/ui/AuroraBackground";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import GradientFill from "@/components/ui/GradientFill";
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    GRADIENTS,
    SPACING,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface RowProps {
  icon: IoniconsName;
  label: string;
  color: string;
  value?: string;
  badge?: string | number;
  last?: boolean;
  onPress?: () => void;
}

function Row({ icon, label, color, value, badge, last, onPress }: RowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.rowCircle, { backgroundColor: color + "26", borderColor: color + "55" }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.rowLabel} numberOfLines={1}>
        {label}
      </Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {badge !== undefined ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const username = user?.name ?? "Member";
  const points = user?.pointsBalance ?? 0;

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profil</Text>
          </View>

          {/* ── Account card ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/edit-profile")}
          >
            <GlassCard highlighted style={styles.accountCard}>
              <View style={styles.avatarCircle}>
                <GradientFill colors={GRADIENTS.primary} />
                <Ionicons name="person" size={28} color={COLORS.textOnPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.accountName} numberOfLines={1}>
                  {username}
                </Text>
                <View style={styles.proRow}>
                  <Ionicons name="flash" size={12} color={COLORS.primaryLight} />
                  <Text style={styles.accountTier}>{points} crédits</Text>
                </View>
              </View>
              <View style={styles.editPill}>
                <Ionicons name="pencil" size={14} color={COLORS.text} />
              </View>
            </GlassCard>
          </TouchableOpacity>

          {/* ── General ── */}
          <Eyebrow style={styles.sectionLabel}>Général</Eyebrow>
          <GlassCard style={styles.group}>
            <Row
              icon="notifications"
              label="Notifications"
              color={COLORS.magenta}
              badge={3}
              onPress={() => router.push("/notifications")}
            />
            <Row
              icon="wallet"
              label="Mes crédits"
              color={COLORS.warning}
              value={`${points}`}
              onPress={() => router.push("/credits")}
            />
            <Row
              icon="time"
              label="Historique des entrées"
              color={COLORS.success}
              last
              onPress={() => router.push("/check-in-history")}
            />
          </GlassCard>

          {/* ── Network ── */}
          <Eyebrow style={styles.sectionLabel}>Réseau</Eyebrow>
          <GlassCard style={styles.group}>
            <Row icon="location" label="Mes adresses" color={COLORS.primaryLight} />
            <Row icon="language" label="Langue" color={COLORS.indigo} value="Français" />
            <Row icon="ticket" label="Mes coupons" color={COLORS.primary} badge={2} />
            <Row icon="card" label="Moyens de paiement" color={COLORS.success} last />
          </GlassCard>

          {/* ── Support ── */}
          <Eyebrow style={styles.sectionLabel}>Aide &amp; Support</Eyebrow>
          <GlassCard style={styles.group}>
            <Row icon="information-circle" label="À propos" color={COLORS.primaryLight} />
            <Row icon="document-text" label="Conditions générales" color={COLORS.indigo} />
            <Row icon="shield-checkmark" label="Politique de confidentialité" color={COLORS.magenta} last />
          </GlassCard>

          <View style={styles.signOutWrap}>
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={signOut}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={18} color={COLORS.primaryLight} />
              <Text style={styles.signOutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.versionNote}>v1.0.0 · Conçu avec ♥ au Maroc</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },

  header: { alignItems: "center", paddingVertical: SPACING.md },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },

  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  accountName: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  proRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  accountTier: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.primaryLight,
  },
  editPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.glass,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionLabel: { marginTop: SPACING.xl, marginBottom: SPACING.sm },

  group: { paddingHorizontal: SPACING.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.sm + 4,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  rowValue: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 7,
    backgroundColor: COLORS.magenta,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: COLORS.white, fontSize: 11, fontFamily: FONTS.bold },

  signOutWrap: { marginTop: SPACING.xl, alignItems: "center" },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.xl,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.glass,
  },
  signOutText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryLight,
    fontFamily: FONTS.semibold,
  },

  versionNote: {
    textAlign: "center",
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
  },
});
