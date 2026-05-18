import AccessAnyGym from "@/components/AccessAnyGym";
import GradientSurface from "@/components/ui/GradientSurface";
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
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function UnityPill() {
  return (
    <View style={pillS.wrap}>
      <View style={pillS.dot} />
      <Text style={pillS.text}>UNITYFITNESS</Text>
    </View>
  );
}
const pillS = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(20,12,28,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F0C5FF",
  },
  text: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.black,
    color: "#FFFFFF",
    letterSpacing: 0.6,
  },
});

interface StatCardProps {
  label: string;
  value: string;
  icon: IoniconsName;
  onPress?: () => void;
}
function StatCard({ label, value, icon, onPress }: StatCardProps) {
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
    >
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={20} color={COLORS.accent} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Wrapper>
  );
}

interface ActionPillProps {
  label: string;
  icon: IoniconsName;
  onPress: () => void;
}
function ActionPill({ label, icon, onPress }: ActionPillProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.pillTouch}
    >
      <GradientSurface radius={RADIUS.md} style={styles.pillSurface}>
        <View style={styles.pillContent}>
          <Ionicons name={icon} size={20} color="#FFFFFF" />
          <Text style={styles.pillLabel}>{label}</Text>
        </View>
      </GradientSurface>
    </TouchableOpacity>
  );
}

function DiscoverPlansBanner({ onPress }: { onPress: () => void }) {
  const arrowScale = useRef(new Animated.Value(1)).current;
  const mount = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(mount, {
      toValue: 1,
      duration: 600,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowScale, {
          toValue: 1.2,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(arrowScale, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={{ opacity: mount, marginTop: SPACING.md }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
        <GradientSurface radius={18}>
          <View style={banner.row}>
            <View style={banner.left}>
              <View style={banner.iconCircle}>
                <Ionicons name="flash" size={20} color={COLORS.white} />
              </View>
              <View style={banner.textWrap}>
                <Text style={banner.title}>Discover our plans</Text>
                <Text style={banner.subtitle}>
                  Buy points once · Use them everywhere
                </Text>
              </View>
            </View>

            <Animated.View style={{ transform: [{ scale: arrowScale }] }}>
              <View style={banner.arrowCircle}>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
              </View>
            </Animated.View>
          </View>
        </GradientSurface>
      </TouchableOpacity>
    </Animated.View>
  );
}

const banner = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm + 6,
    paddingHorizontal: SPACING.md,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm + 4,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1 },
  title: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SPACING.sm,
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const username = user?.name?.split(" ")[0] ?? "there";

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Sticky header: avatar + status dot · QR scan button ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <View style={styles.avatarRing}>
            <Ionicons name="person" size={20} color={COLORS.white} />
          </View>
          <View style={styles.statusDot} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerHello}>Welcome back</Text>
          <Text style={styles.headerName} numberOfLines={1}>
            {username}
          </Text>
        </View>

        <AccessAnyGym
          variant="icon"
          iconBg={COLORS.accent}
          iconColor={COLORS.white}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.accent]}
          />
        }
      >
        <GradientSurface radius={RADIUS.xl} style={styles.heroCard} dimmer={0.08}>
          <View style={styles.heroPill} pointerEvents="none">
            <UnityPill />
          </View>

          <View style={styles.heroBody}>
            <Text style={styles.heroGreeting}>Hey {username} 👋</Text>
            <Text style={styles.heroHeadline}>
              Get all-in-one{"\n"}access.
            </Text>
            <Text style={styles.heroDesc}>
              Explore clubs, take classes, UnityFitness with one subscription.
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.push("/(tabs)/explore")}
              activeOpacity={0.9}
            >
              <Text style={styles.heroBtnText}>Explore Clubs Near You</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </GradientSurface>

        <View style={styles.statsRow}>
          <StatCard
            label="Credits"
            value={String(user?.pointsBalance ?? 0)}
            icon="wallet-outline"
            onPress={() => router.push("/credits")}
          />
          <StatCard
            label="Check-ins"
            value="—"
            icon="checkmark-circle-outline"
          />
          <StatCard label="Gyms" value="12+" icon="location-outline" />
        </View>

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.pillsRow}>
          <AccessAnyGym variant="pill" />
          <ActionPill
            label="Top Up"
            icon="add-circle-outline"
            onPress={() => router.push("/top-up")}
          />
          <ActionPill
            label="History"
            icon="time-outline"
            onPress={() => router.push("/check-in-history")}
          />
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/explore")}
          activeOpacity={0.88}
        >
          <GradientSurface radius={18}>
            <View style={styles.nearbyRow}>
              <View style={styles.nearbyIcon}>
                <Ionicons name="location" size={20} color={COLORS.white} />
              </View>
              <View style={styles.nearbyText}>
                <Text style={styles.nearbyTitle}>Find clubs near you</Text>
                <Text style={styles.nearbySubtitle}>
                  12 partner clubs within 10 km
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255,255,255,0.7)"
              />
            </View>
          </GradientSurface>
        </TouchableOpacity>

        <DiscoverPlansBanner onPress={() => router.push("/(tabs)/plans")} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  avatarBtn: {
    position: "relative",
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.surfaceElevated,
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  headerCenter: { flex: 1 },
  headerHello: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  headerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
    marginTop: 1,
    letterSpacing: -0.3,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },

  heroCard: {
    marginBottom: SPACING.lg,
  },
  heroPill: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 3,
  },
  heroBody: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg + 2,
  },
  heroGreeting: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.78)",
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: SPACING.sm + 2,
  },
  heroHeadline: {
    fontSize: 32,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
    lineHeight: 36,
    letterSpacing: -0.8,
    marginBottom: SPACING.sm + 4,
    maxWidth: 240,
  },
  heroDesc: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 20,
    marginBottom: SPACING.lg,
    maxWidth: 240,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs + 2,
    backgroundColor: COLORS.white,
    alignSelf: "flex-start",
    paddingVertical: SPACING.sm + 3,
    paddingHorizontal: SPACING.md + 2,
    borderRadius: RADIUS.full,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  heroBtnText: {
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.sm,
  },

  statsRow: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    ...SHADOWS.soft,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
  },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },

  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  pillsRow: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.lg },
  pillTouch: { flex: 1 },
  pillSurface: {
    flex: 1,
  },
  pillContent: {
    alignItems: "center",
    gap: 4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  pillLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    textAlign: "center",
  },

  nearbyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm + 4,
    paddingVertical: SPACING.sm + 6,
    paddingHorizontal: SPACING.md,
  },
  nearbyIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  nearbyText: { flex: 1 },
  nearbyTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
  },
  nearbySubtitle: {
    fontSize: FONT_SIZES.xs,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
});
