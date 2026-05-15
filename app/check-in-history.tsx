// app/check-in-history.tsx
// Check-in history screen with a silk stats card, bar chart, and timeline.
//
// Navigate to: router.push("/check-in-history")

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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
    Defs,
    LinearGradient as SvgLinearGradient,
    Rect,
    Stop,
} from "react-native-svg";

import {
    COLORS,
    FONT_SIZES,
    FONT_WEIGHTS,
    RADIUS,
    SHADOWS,
    SPACING,
} from "@/constants/theme";

// ── Mock data ──────────────────────────────────────────────────────────────
const WEEKLY_BARS = [
  { day: "M", sessions: 1 },
  { day: "T", sessions: 0 },
  { day: "W", sessions: 2 },
  { day: "T", sessions: 1 },
  { day: "F", sessions: 2 },
  { day: "S", sessions: 0 },
  { day: "S", sessions: 1 },
];
const MAX_SESSIONS = Math.max(...WEEKLY_BARS.map((b) => b.sessions), 1);

interface CheckIn {
  id: string;
  gym: string;
  city: string;
  date: string;
  time: string;
  pts: number;
  tier: number;
}

const CHECKINS: CheckIn[] = [
  {
    id: "1",
    gym: "FitClub Casablanca",
    city: "Casablanca",
    date: "Today",
    time: "07:32",
    pts: 3,
    tier: 2,
  },
  {
    id: "2",
    gym: "EliteGym Rabat",
    city: "Rabat",
    date: "Yesterday",
    time: "18:15",
    pts: 5,
    tier: 3,
  },
  {
    id: "3",
    gym: "SportHub Marrakech",
    city: "Marrakech",
    date: "Mon, 5 May",
    time: "09:00",
    pts: 2,
    tier: 1,
  },
  {
    id: "4",
    gym: "FitClub Casablanca",
    city: "Casablanca",
    date: "Mon, 5 May",
    time: "07:15",
    pts: 3,
    tier: 2,
  },
  {
    id: "5",
    gym: "EliteGym Rabat",
    city: "Rabat",
    date: "Fri, 2 May",
    time: "19:00",
    pts: 5,
    tier: 3,
  },
];

const TOTAL_CHECKINS = CHECKINS.length;
const TOTAL_PTS = CHECKINS.reduce((s, c) => s + c.pts, 0);
const FAVE_GYM = "FitClub Casablanca";

// ── Screen ─────────────────────────────────────────────────────────────────
export default function CheckInHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check-in History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Silk stats card ── */}
        <View style={styles.statsCard}>
          <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
            <Defs>
              <SvgLinearGradient id="histGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="1" />
                <Stop offset="40%" stopColor={COLORS.primaryLight} stopOpacity="1" />
                <Stop offset="100%" stopColor={COLORS.primaryDark} stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#histGrad)" />
          </Svg>

          <View style={styles.statsBlob} />

          {/* Top stats row */}
          <View style={styles.topStats}>
            <View style={styles.topStat}>
              <Text style={styles.topStatValue}>{TOTAL_CHECKINS}</Text>
              <Text style={styles.topStatLabel}>Total check-ins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.topStat}>
              <Text style={styles.topStatValue}>{TOTAL_PTS}</Text>
              <Text style={styles.topStatLabel}>Points used</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.topStat}>
              <Text style={styles.topStatValue}>3</Text>
              <Text style={styles.topStatLabel}>Gyms visited</Text>
            </View>
          </View>

          {/* Favourite gym */}
          <View style={styles.favRow}>
            <Ionicons name="star" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.favText}>Favourite: {FAVE_GYM}</Text>
          </View>

          {/* Weekly bar chart */}
          <Text style={styles.chartTitle}>This week</Text>
          <View style={styles.chart}>
            {WEEKLY_BARS.map((b, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(b.sessions / MAX_SESSIONS) * 100}%`,
                        opacity: b.sessions === 0 ? 0.25 : 1,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barDay}>{b.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Timeline ── */}
        <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
        <View style={styles.timeline}>
          {CHECKINS.map((c, i) => (
            <View key={c.id} style={styles.timelineItem}>
              {/* Vertical connector */}
              <View style={styles.connector}>
                <View style={styles.dot} />
                {i < CHECKINS.length - 1 && <View style={styles.line} />}
              </View>

              {/* Card */}
              <View style={styles.timelineCard}>
                <View style={styles.timelineTop}>
                  <View style={styles.timelineName}>
                    <Text style={styles.gymName}>{c.gym}</Text>
                    <View style={styles.cityRow}>
                      <Ionicons
                        name="location-outline"
                        size={12}
                        color={COLORS.textMuted}
                      />
                      <Text style={styles.cityText}>{c.city}</Text>
                    </View>
                  </View>
                  <View style={styles.ptsTag}>
                    <Ionicons name="flash" size={11} color={COLORS.accent} />
                    <Text style={styles.ptsText}>−{c.pts} pts</Text>
                  </View>
                </View>
                <View style={styles.timelineBottom}>
                  <Text style={styles.dateText}>
                    {c.date} · {c.time}
                  </Text>
                  <View style={styles.tierTag}>
                    <Text style={styles.tierText}>T{c.tier}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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

  statsCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    overflow: "hidden",
    ...SHADOWS.pop,
  },
  statsBlob: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.35,
  },

  topStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  topStat: { flex: 1, alignItems: "center" },
  topStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
  },
  topStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  favRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: SPACING.lg,
  },
  favText: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.8)",
    fontWeight: FONT_WEIGHTS.medium,
  },

  chartTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    height: 60,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  barTrack: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 3,
    minHeight: 4,
  },
  barDay: {
    fontSize: FONT_SIZES.xs,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },

  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
  },

  timeline: { gap: 0 },
  timelineItem: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  connector: {
    alignItems: "center",
    width: 16,
    paddingTop: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.accentMuted,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.border,
    marginTop: 4,
  },

  timelineCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  timelineTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  timelineName: { flex: 1 },
  gymName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  cityText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  ptsTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: COLORS.accentMuted,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  ptsText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.accent,
  },
  timelineBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  tierTag: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  tierText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
});
