// app/(tabs)/profile.tsx
//
// Dark profile with lavender accents — inspired by the orange/dark
// screenshots, with orange swapped for COLORS.primary (lavender).
//
// The whole screen is dark on purpose — the "Dark Mode" toggle reflects
// that state. If you wire it to a real theme context later, switch the
// `dark` constant below to a hook value.

import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  RADIUS,
  SHADOWS,
  SPACING,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
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

import LightPillar from "@/components/ui/LightPillar";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// ── Dark palette (local to this screen) ────────────────────────────────────
const DARK = {
  bg: "#13121C",
  bg2: "#1B1A26",
  cardBg: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.06)",
  rowDivider: "rgba(255,255,255,0.06)",
  text: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.5)",
  tabInactive: "rgba(255,255,255,0.5)",
  badge: "#E94B5C",
  danger: "#FF6B6B",
};

// ── Row ────────────────────────────────────────────────────────────────────
interface RowProps {
  icon: IoniconsName;
  label: string;
  value?: string;
  badge?: string | number;
  toggle?: boolean;
  onToggle?: () => void;
  danger?: boolean;
  last?: boolean;
  onPress?: () => void;
}

function Row({
  icon,
  label,
  value,
  badge,
  toggle,
  onToggle,
  danger,
  last,
  onPress,
}: RowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={toggle !== undefined ? onToggle : onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.rowIconWrap,
          danger && { backgroundColor: "rgba(255,107,107,0.15)" },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={danger ? DARK.danger : COLORS.primary}
        />
      </View>

      <Text
        style={[styles.rowLabel, danger && { color: DARK.danger }]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {value ? <Text style={styles.rowValue}>{value}</Text> : null}

      {badge !== undefined ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}

      {toggle !== undefined ? (
        <View
          style={[
            styles.toggleTrack,
            toggle && { backgroundColor: COLORS.primary },
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              toggle && { left: 22 },
            ]}
          />
        </View>
      ) : null}

      {toggle === undefined && badge === undefined && !danger ? (
        <Ionicons name="chevron-forward" size={16} color={DARK.tabInactive} />
      ) : null}
    </TouchableOpacity>
  );
}

// ── Section label ──────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.sectionLabelRow}>
      <View style={styles.sectionDot} />
      <Text style={styles.sectionLabelText}>{children}</Text>
    </View>
  );
}

// ── Card wrapper ───────────────────────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

// ── Main screen ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const username = user?.name ?? "Member";
  const email = user?.email ?? "—";
  const points = user?.pointsBalance ?? 0;
  const nextReward = 100;
  const pct = Math.min(1, points / nextReward);

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={["top"]} style={styles.heroSafe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero card ─────────────────────────────────── */}
          <View style={styles.hero}>
            {/* Animated pillar (no circle blobs) */}
            <View style={styles.pillarLayer} pointerEvents="none">
              <LightPillar width={500} height={260} seed="B" animated />
            </View>

            <View style={styles.heroRow}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={30} color={COLORS.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroName} numberOfLines={1}>
                  {username}
                </Text>
                <Text style={styles.heroEmail} numberOfLines={1}>
                  {email}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Loyalty bar */}
            <View style={styles.loyalty}>
              <View style={styles.loyaltyHeader}>
                <Text style={styles.loyaltyLabel}>Loyalty Points</Text>
                <Text style={styles.loyaltyValue}>{points} pts</Text>
              </View>
              <View style={styles.loyaltyTrack}>
                <View
                  style={[
                    styles.loyaltyFill,
                    { width: `${pct * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.loyaltyHint}>
                Earn {Math.max(0, nextReward - points)} more points for a
                free check-in
              </Text>
            </View>
          </View>

          {/* ── Sections ──────────────────────────────────── */}
          <View style={styles.sections}>
            <SectionLabel>General</SectionLabel>
            <Card>
              <Row icon="person-outline" label="Profile" />
              <Row icon="location-outline" label="My Addresses" />
              <Row icon="language-outline" label="Language" value="English" />
              <Row
                icon="moon-outline"
                label="Dark Mode"
                toggle={darkMode}
                onToggle={() => setDarkMode((v) => !v)}
              />
              <Row icon="notifications-outline" label="Notifications" badge={3} last />
            </Card>

            <SectionLabel>My Club</SectionLabel>
            <Card>
              <Row
                icon="wallet-outline"
                label="My Points"
                value={`${points} pts`}
              />
              <Row icon="barbell-outline" label="Schedule a class" />
              <Row
                icon="time-outline"
                label="Check-in history"
                last
                onPress={() => router.push("/check-in-history")}
              />
            </Card>

            <SectionLabel>Promotions &amp; Rewards</SectionLabel>
            <Card>
              <Row icon="ticket-outline" label="My Coupons" badge={2} />
              <Row icon="gift-outline" label="Rewards" />
              <Row icon="card-outline" label="Payment Methods" last />
            </Card>

            <SectionLabel>Help &amp; Support</SectionLabel>
            <Card>
              <Row icon="information-circle-outline" label="About" />
              <Row icon="document-text-outline" label="Terms &amp; Conditions" />
              <Row icon="shield-checkmark-outline" label="Privacy Policy" last />
            </Card>

            {/* Sign out — outlined pill */}
            <View style={styles.signOutWrap}>
              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={signOut}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={18} color={COLORS.primary} />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.versionNote}>
              v1.0.0 · Made with ♥ in Morocco
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK.bg },
  heroSafe: { flex: 1, backgroundColor: "#0E0A1F" },
  scroll: {
    backgroundColor: DARK.bg,
    paddingBottom: SPACING.xxxl,
  },

  // ── Hero ─────────────────────────────────────────────────
  hero: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    overflow: "hidden",
    position: "relative",
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    backgroundColor: "#0E0A1F",
  },
  heroBlob: { display: "none" },
  pillarLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroName: {
    fontSize: 18,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  heroEmail: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  loyalty: {
    marginTop: SPACING.md,
  },
  loyaltyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6,
  },
  loyaltyLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.92)",
    fontWeight: FONT_WEIGHTS.semibold,
  },
  loyaltyValue: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.black,
  },
  loyaltyTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
    overflow: "hidden",
  },
  loyaltyFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: COLORS.white,
  },
  loyaltyHint: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    marginTop: 6,
  },

  // ── Sections ─────────────────────────────────────────────
  sections: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  sectionLabelText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 0.3,
  },

  card: {
    backgroundColor: DARK.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DARK.cardBorder,
    overflow: "hidden",
  },

  // ── Row ──────────────────────────────────────────────────
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm + 6,
    paddingVertical: SPACING.sm + 6,
    gap: SPACING.sm + 4,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: DARK.rowDivider,
  },
  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(159,153,199,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: DARK.text,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  rowValue: {
    fontSize: 13,
    color: DARK.textMuted,
  },

  // ── Badge ────────────────────────────────────────────────
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 7,
    backgroundColor: DARK.badge,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
  },

  // ── Toggle ───────────────────────────────────────────────
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    position: "relative",
  },
  toggleThumb: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    ...SHADOWS.soft,
  },

  // ── Sign out ─────────────────────────────────────────────
  signOutWrap: {
    marginTop: SPACING.xl,
    alignItems: "center",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.xl,
    borderRadius: 999,
    backgroundColor: "rgba(159,153,199,0.1)",
    borderWidth: 1,
    borderColor: "rgba(159,153,199,0.3)",
  },
  signOutText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },

  versionNote: {
    textAlign: "center",
    fontSize: FONT_SIZES.xs,
    color: DARK.textMuted,
    marginTop: SPACING.md,
  },
});
