// app/gym/[id].tsx
// Gym detail screen — push from Explore or Home.
// Uses mock data; replace with a real gymService.getById(id) call.
//
// Navigate to: router.push({ pathname: "/gym/[id]", params: { id: gym._id } })

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
    Circle,
    Defs,
    LinearGradient as SvgLinearGradient,
    Rect,
    Stop,
} from "react-native-svg";

import AuroraBackground from "@/components/ui/AuroraBackground";
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    RADIUS,
    SHADOWS,
    SPACING,
} from "@/constants/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// ── Mock data ──────────────────────────────────────────────────────────────
interface GymDetail {
  name: string;
  city: string;
  tier: number;
  pointsPerSession: number;
  description: string;
  equipment: string[];
  classes: { name: string; time: string; duration: string }[];
  hours: { day: string; open: string; close: string }[];
}

const MOCK: Record<string, GymDetail> = {
  default: {
    name: "FitClub Casablanca",
    city: "Casablanca",
    tier: 2,
    pointsPerSession: 3,
    description:
      "Modern facility with state-of-the-art equipment and group classes for all levels.",
    equipment: ["Free Weights", "Cardio Zone", "CrossFit", "Swimming Pool"],
    classes: [
      { name: "HIIT Blast", time: "07:00", duration: "45 min" },
      { name: "Yoga Flow", time: "09:00", duration: "60 min" },
      { name: "Spin Cycle", time: "12:00", duration: "45 min" },
      { name: "Boxing", time: "18:30", duration: "60 min" },
    ],
    hours: [
      { day: "Mon – Fri", open: "06:00", close: "22:00" },
      { day: "Saturday", open: "08:00", close: "20:00" },
      { day: "Sunday", open: "09:00", close: "18:00" },
    ],
  },
};

// ── Subcomponents ──────────────────────────────────────────────────────────
function StatPill({
  icon,
  label,
}: {
  icon: IoniconsName;
  label: string;
}) {
  return (
    <View style={stat.pill}>
      <Ionicons name={icon} size={14} color="rgba(255,255,255,0.85)" />
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

const stat = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  label: {
    color: "rgba(255,255,255,0.85)",
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semibold,
  },
});

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={card.wrap}>
      <Text style={card.title}>{title}</Text>
      {children}
    </View>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
  },
});

// ── Screen ─────────────────────────────────────────────────────────────────
export default function GymDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const gym = MOCK[id ?? ""] ?? MOCK.default;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AuroraBackground />
      {/* ── Silk gradient header ── */}
      <View style={styles.header}>
        <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
          <Defs>
            <SvgLinearGradient id="gymGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="1" />
              <Stop offset="50%" stopColor={COLORS.primaryDark} stopOpacity="1" />
              <Stop offset="100%" stopColor={COLORS.accent} stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#gymGrad)" />
        </Svg>

        {/* Blobs */}
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />

        {/* Rings */}
        <Svg
          width={160}
          height={160}
          viewBox="0 0 160 160"
          style={styles.rings}
        >
          <Circle
            cx={80}
            cy={80}
            r={68}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
            strokeDasharray="3 6"
          />
        </Svg>

        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>

        {/* Gym info */}
        <View style={styles.gymInfo}>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>Tier {gym.tier}</Text>
          </View>
          <Text style={styles.gymName}>{gym.name}</Text>
          <View style={styles.cityRow}>
            <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.75)" />
            <Text style={styles.cityText}>{gym.city}</Text>
          </View>
          <View style={styles.statsRow}>
            <StatPill
              icon="flash-outline"
              label={`${gym.pointsPerSession} pts / session`}
            />
            <StatPill
              icon="barbell-outline"
              label={`${gym.equipment.length} equipment types`}
            />
          </View>
        </View>
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <Text style={styles.description}>{gym.description}</Text>

        {/* Classes */}
        <SectionCard title="Today's Classes">
          {gym.classes.map((c, i) => (
            <View
              key={i}
              style={[
                styles.classRow,
                i < gym.classes.length - 1 && styles.classRowBorder,
              ]}
            >
              <View style={styles.classTime}>
                <Text style={styles.classTimeText}>{c.time}</Text>
                <Text style={styles.classDuration}>{c.duration}</Text>
              </View>
              <Text style={styles.className}>{c.name}</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={COLORS.textMuted}
              />
            </View>
          ))}
        </SectionCard>

        {/* Equipment */}
        <SectionCard title="Equipment">
          <View style={styles.equipmentGrid}>
            {gym.equipment.map((eq) => (
              <View key={eq} style={styles.equipmentTag}>
                <Text style={styles.equipmentText}>{eq}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        {/* Hours */}
        <SectionCard title="Opening Hours">
          {gym.hours.map((h, i) => (
            <View
              key={i}
              style={[
                styles.hoursRow,
                i < gym.hours.length - 1 && styles.hoursRowBorder,
              ]}
            >
              <Text style={styles.hoursDay}>{h.day}</Text>
              <Text style={styles.hoursTime}>
                {h.open} – {h.close}
              </Text>
            </View>
          ))}
        </SectionCard>
      </ScrollView>

      {/* ── Check-in CTA ── */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerLabel}>Cost</Text>
          <Text style={styles.footerValue}>
            {gym.pointsPerSession} pts per session
          </Text>
        </View>
        <TouchableOpacity style={styles.checkInBtn} activeOpacity={0.85}>
          <Ionicons
            name="qr-code-outline"
            size={18}
            color={COLORS.textOnPrimary}
          />
          <Text style={styles.checkInText}>Check In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    overflow: "hidden",
    ...SHADOWS.pop,
  },
  blobTop: {
    position: "absolute",
    top: -50,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.35,
  },
  blobBottom: {
    position: "absolute",
    bottom: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.accentLight,
    opacity: 0.45,
  },
  rings: {
    position: "absolute",
    top: -20,
    right: -30,
    opacity: 0.5,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },

  gymInfo: { zIndex: 1 },
  tierBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  tierText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  gymName: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.black,
    color: COLORS.white,
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: SPACING.md,
  },
  cityText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: FONT_SIZES.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    flexWrap: "wrap",
  },

  scroll: { flex: 1 },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },

  description: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },

  classRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  classRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  classTime: { width: 56 },
  classTimeText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  classDuration: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  className: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },

  equipmentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  equipmentTag: {
    backgroundColor: COLORS.accentMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  equipmentText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semibold,
    color: COLORS.accentLight,
  },

  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
  },
  hoursRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  hoursDay: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  hoursTime: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.card,
  },
  footerLeft: {},
  footerLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  footerValue: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  checkInBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
  },
  checkInText: {
    color: COLORS.textOnPrimary,
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZES.base,
  },
});
