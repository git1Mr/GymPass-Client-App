// app/(tabs)/index.tsx
// Changes from previous version:
//   1. "Scan QR" pill replaced with <AccessAnyGym variant="pill" />
//   2. Animated "Discover our plans" banner added below nearbyCard

import AccessAnyGym from "@/components/AccessAnyGym";
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

// ── Stat card ──────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}
function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={20} color={COLORS.accent} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Action pill (generic) ──────────────────────────────────────────────────
interface ActionPillProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
}
function ActionPill({ label, icon, onPress }: ActionPillProps) {
  return (
    <TouchableOpacity
      style={styles.pill}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Ionicons name={icon} size={18} color={COLORS.accent} />
      <Text style={styles.pillLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── "Discover our plans" animated banner ───────────────────────────────────
function DiscoverPlansBanner({ onPress }: { onPress: () => void }) {
  // 1. Fade + slide-up on mount
  const mountAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // 2. Continuous gentle pulse on the CTA arrow
  const arrowScale = useRef(new Animated.Value(1)).current;
  // 3. Shimmer highlight moving across the card²
  const shimmerX = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    // Mount animation
    Animated.parallel([
      Animated.timing(mountAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Arrow pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowScale, {
          toValue: 1.25,
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

    // Shimmer loop — sweeps across card every 2.5s
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerX, {
          toValue: 400,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(1600),
        Animated.timing(shimmerX, {
          toValue: -200,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[banner.wrap, { opacity: mountAnim, transform: [{ translateY }] }]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.88}
        style={banner.card}
      >
        {/* Shimmer sweep */}
        <Animated.View
          style={[banner.shimmer, { transform: [{ translateX: shimmerX }] }]}
          pointerEvents="none"
        />

        {/* Left: icon + text */}
        <View style={banner.left}>
          <View style={banner.iconCircle}>
            <Ionicons name="flash" size={20} color={COLORS.accent} />
          </View>
          <View style={banner.textWrap}>
            <Text style={banner.title}>Discover our plans</Text>
            <Text style={banner.subtitle}>
              Buy points once · Use them everywhere
            </Text>
          </View>
        </View>

        {/* Right: pulsing arrow */}
        <Animated.View style={{ transform: [{ scale: arrowScale }] }}>
          <View style={banner.arrowCircle}>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const banner = StyleSheet.create({
  wrap: {
    marginTop: SPACING.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    overflow: "hidden",
    ...SHADOWS.card,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: "#FFFFFF18",
    transform: [{ skewX: "-20deg" }],
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF22",
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
    color: COLORS.white,
    opacity: 0.75,
    marginTop: 2,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF22",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SPACING.sm,
  },
});

// ── Main screen ────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const username = user?.name?.split(" ")[0] ?? "there";

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>G</Text>
          </View>
          <Text style={styles.logoWord}>GYMPASS</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="person-circle-outline"
            size={32}
            color={COLORS.accent}
          />
        </TouchableOpacity>
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
        {/* ── Hero ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroBlob} />
          <Text style={styles.heroGreeting}>Hey {username} 👋</Text>
          <Text style={styles.heroHeadline}>Get all-in-one{"\n"}access.</Text>
          <Text style={styles.heroBody}>
            Explore clubs, take classes, GymPass with one subscription.
          </Text>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => router.push("/(tabs)/explore")}
            activeOpacity={0.85}
          >
            <Text style={styles.heroBtnText}>Explore Gyms</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <StatCard
            label="Points"
            value={String(user?.pointsBalance ?? 0)}
            icon="wallet-outline"
          />
          <StatCard
            label="Check-ins"
            value="—"
            icon="checkmark-circle-outline"
          />
          <StatCard label="Gyms" value="12+" icon="location-outline" />
        </View>

        {/* ── Quick actions ── */}
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.pillsRow}>
          {/* ↓ Replaced "Scan QR" with AccessAnyGym component */}
          <AccessAnyGym variant="pill" />

          <ActionPill
            label="Buy Points"
            icon="add-circle-outline"
            onPress={() => router.push("/(tabs)/plans")}
          />
          <ActionPill label="History" icon="time-outline" onPress={() => {}} />
        </View>

        {/* ── Nearby gyms ── */}
        <View style={styles.nearbyCard}>
          <Ionicons name="location" size={20} color={COLORS.primary} />
          <View style={styles.nearbyText}>
            <Text style={styles.nearbyTitle}>Find gyms near you</Text>
            <Text style={styles.nearbySubtitle}>
              12 partner clubs within 10 km
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/explore")}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={20} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

        {/* ── "Discover our plans" animated banner ── */}
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
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.black,
  },
  logoWord: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
    letterSpacing: 3,
  },
  profileBtn: { padding: SPACING.xs },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    overflow: "hidden",
    ...SHADOWS.card,
  },
  heroBlob: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.accent,
    opacity: 0.15,
  },
  heroGreeting: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textOnPrimary,
    opacity: 0.85,
    marginBottom: SPACING.xs,
  },
  heroHeadline: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
    lineHeight: 36,
    marginBottom: SPACING.sm,
  },
  heroBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.accent,
    alignSelf: "flex-start",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  heroBtnText: {
    color: COLORS.white,
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
  pill: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  pillLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  nearbyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  nearbyText: { flex: 1 },
  nearbyTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  nearbySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

// // app/(tabs)/index.tsx
// // Home tab: SafeAreaView header (logo + profile icon), hero greeting,
// // pull-to-refresh to reload home data.

// import {
//     COLORS,
//     FONT_SIZES,
//     FONT_WEIGHTS,
//     RADIUS,
//     SHADOWS,
//     SPACING,
// } from "@/constants/theme";
// import { useAuth } from "@/context/AuthContext";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import React, { useCallback, useState } from "react";
// import {
//     RefreshControl,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// // ── Quick-stat card ────────────────────────────────────────────────────────
// interface StatCardProps {
//   label: string;
//   value: string;
//   icon: React.ComponentProps<typeof Ionicons>["name"];
// }
// function StatCard({ label, value, icon }: StatCardProps) {
//   return (
//     <View style={styles.statCard}>
//       <View style={styles.statIcon}>
//         <Ionicons name={icon} size={20} color={COLORS.accent} />
//       </View>
//       <Text style={styles.statValue}>{value}</Text>
//       <Text style={styles.statLabel}>{label}</Text>
//     </View>
//   );
// }

// // ── Quick-action pill ──────────────────────────────────────────────────────
// interface ActionPillProps {
//   label: string;
//   icon: React.ComponentProps<typeof Ionicons>["name"];
//   onPress: () => void;
// }
// function ActionPill({ label, icon, onPress }: ActionPillProps) {
//   return (
//     <TouchableOpacity
//       style={styles.pill}
//       onPress={onPress}
//       activeOpacity={0.75}
//     >
//       <Ionicons name={icon} size={18} color={COLORS.accent} />
//       <Text style={styles.pillLabel}>{label}</Text>
//     </TouchableOpacity>
//   );
// }

// // ── Main screen ────────────────────────────────────────────────────────────
// export default function HomeScreen() {
//   const router = useRouter();
//   const { user } = useAuth();
//   const [refreshing, setRefreshing] = useState(false);

//   const username = user?.name?.split(" ")[0] ?? "there";

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     try {
//       // Re-fetch home data here — e.g. wallet balance, nearby gyms
//       await new Promise((r) => setTimeout(r, 1200)); // replace with real call
//     } finally {
//       setRefreshing(false);
//     }
//   }, []);

//   return (
//     <SafeAreaView style={styles.safe} edges={["top"]}>
//       {/* ── Header ── */}
//       <View style={styles.header}>
//         {/* Logo */}
//         <View style={styles.logoRow}>
//           <View style={styles.logoMark}>
//             <Text style={styles.logoLetter}>G</Text>
//           </View>
//           <Text style={styles.logoWord}>GYMPASS</Text>
//         </View>

//         {/* Profile icon */}
//         <TouchableOpacity
//           style={styles.profileBtn}
//           onPress={() => router.push("/(tabs)/profile")}
//           activeOpacity={0.7}
//         >
//           <Ionicons
//             name="person-circle-outline"
//             size={32}
//             color={COLORS.accent}
//           />
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor={COLORS.primary}
//             colors={[COLORS.accent]}
//           />
//         }
//       >
//         {/* ── Hero ── */}

//         <View style={styles.heroCard}>
//           {/* Decorative blob */}

//           <Text style={styles.heroGreeting}>Hey {username} 👋</Text>

//           <View style={styles.heroBlob} />

//           <Text style={styles.heroHeadline}>Get all-in-one{"\n"}access.</Text>
//           <Text style={styles.heroBody}>
//             Explore clubs, take classes, GymPass with one subscription.
//           </Text>

//           <TouchableOpacity
//             style={styles.heroBtn}
//             onPress={() => router.push("/(tabs)/explore")}
//             activeOpacity={0.85}
//           >
//             <Text style={styles.heroBtnText}>Explore Gyms</Text>
//             <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
//           </TouchableOpacity>
//         </View>

//         {/* ── Stats row ── */}
//         <View style={styles.statsRow}>
//           <StatCard
//             label="Points"
//             value={String(user?.pointsBalance ?? 0)}
//             icon="wallet-outline"
//           />
//           <StatCard
//             label="Check-ins"
//             value="—"
//             icon="checkmark-circle-outline"
//           />
//           <StatCard label="Gyms" value="12+" icon="location-outline" />
//         </View>

//         {/* ── Quick actions ── */}
//         <Text style={styles.sectionTitle}>Quick actions</Text>
//         <View style={styles.pillsRow}>
//           <ActionPill
//             label="Scan QR"
//             icon="qr-code-outline"
//             onPress={() => {}}
//           />
//           <ActionPill
//             label="Buy Points"
//             icon="add-circle-outline"
//             onPress={() => router.push("/(tabs)/plans")}
//           />
//           <ActionPill label="History" icon="time-outline" onPress={() => {}} />
//         </View>

//         {/* ── Nearby gyms teaser ── */}
//         <View style={styles.nearbyCard}>
//           <Ionicons name="location" size={20} color={COLORS.primary} />
//           <View style={styles.nearbyText}>
//             <Text style={styles.nearbyTitle}>Find gyms near you</Text>
//             <Text style={styles.nearbySubtitle}>
//               12 partner clubs within 10 km
//             </Text>
//           </View>
//           <TouchableOpacity
//             onPress={() => router.push("/(tabs)/explore")}
//             activeOpacity={0.7}
//           >
//             <Ionicons name="chevron-forward" size={20} color={COLORS.accent} />
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },

//   // Header
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: SPACING.lg,
//     paddingVertical: SPACING.sm,
//     backgroundColor: COLORS.surface,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   logoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: SPACING.xs,
//   },
//   logoMark: {
//     width: 32,
//     height: 32,
//     borderRadius: RADIUS.sm,
//     backgroundColor: COLORS.accent,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   logoLetter: {
//     color: COLORS.white,
//     fontSize: FONT_SIZES.md,
//     fontWeight: FONT_WEIGHTS.black,
//   },
//   logoWord: {
//     fontSize: FONT_SIZES.md,
//     fontWeight: FONT_WEIGHTS.black,
//     color: COLORS.text,
//     letterSpacing: 3,
//   },
//   profileBtn: {
//     padding: SPACING.xs,
//   },

//   // Scroll
//   scroll: { flex: 1 },
//   scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },

//   // Hero card
//   heroCard: {
//     backgroundColor: COLORS.primary,
//     borderRadius: RADIUS.xl,
//     padding: SPACING.xl,
//     marginBottom: SPACING.lg,
//     overflow: "hidden",
//     ...SHADOWS.card,
//   },
//   heroBlob: {
//     position: "absolute",
//     top: -40,
//     right: -40,
//     width: 160,
//     height: 160,
//     borderRadius: 80,
//     backgroundColor: COLORS.accent,
//     opacity: 0.15,
//   },
//   heroGreeting: {
//     fontSize: FONT_SIZES.xl,
//     paddingBottom: SPACING.sm,
//     color: COLORS.textOnPrimary,
//     opacity: 0.85,
//     marginBottom: SPACING.xs,
//   },
//   heroHeadline: {
//     fontSize: FONT_SIZES.xxl,
//     fontWeight: FONT_WEIGHTS.black,
//     color: COLORS.white,
//     lineHeight: 36,
//     marginBottom: SPACING.sm,
//   },
//   heroBody: {
//     fontSize: FONT_SIZES.sm,
//     color: COLORS.white,
//     opacity: 0.8,
//     lineHeight: 20,
//     marginBottom: SPACING.lg,
//   },
//   heroBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: SPACING.xs,
//     backgroundColor: COLORS.accent,
//     alignSelf: "flex-start",
//     paddingVertical: SPACING.sm,
//     paddingHorizontal: SPACING.md,
//     borderRadius: RADIUS.full,
//   },
//   heroBtnText: {
//     color: COLORS.white,
//     fontWeight: FONT_WEIGHTS.bold,
//     fontSize: FONT_SIZES.sm,
//   },

//   // Stats
//   statsRow: {
//     flexDirection: "row",
//     gap: SPACING.sm,
//     marginBottom: SPACING.lg,
//   },
//   statCard: {
//     flex: 1,
//     backgroundColor: COLORS.surface,
//     borderRadius: RADIUS.md,
//     padding: SPACING.md,
//     alignItems: "center",
//     ...SHADOWS.soft,
//   },
//   statIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: COLORS.accentMuted,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: SPACING.xs,
//   },
//   statValue: {
//     fontSize: FONT_SIZES.lg,
//     fontWeight: FONT_WEIGHTS.black,
//     color: COLORS.text,
//   },
//   statLabel: {
//     fontSize: FONT_SIZES.xs,
//     color: COLORS.textMuted,
//     marginTop: 2,
//   },

//   // Quick actions
//   sectionTitle: {
//     fontSize: FONT_SIZES.md,
//     fontWeight: FONT_WEIGHTS.bold,
//     color: COLORS.text,
//     marginBottom: SPACING.sm,
//   },
//   pillsRow: {
//     flexDirection: "row",
//     gap: SPACING.sm,
//     marginBottom: SPACING.lg,
//   },
//   pill: {
//     flex: 1,
//     flexDirection: "column",
//     alignItems: "center",
//     gap: 4,
//     backgroundColor: COLORS.surface,
//     borderRadius: RADIUS.md,
//     paddingVertical: SPACING.md,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     ...SHADOWS.soft,
//   },
//   pillLabel: {
//     fontSize: FONT_SIZES.xs,
//     fontWeight: FONT_WEIGHTS.semibold,
//     color: COLORS.text,
//   },

//   // Nearby
//   nearbyCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: COLORS.surface,
//     borderRadius: RADIUS.md,
//     padding: SPACING.md,
//     gap: SPACING.sm,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     ...SHADOWS.soft,
//   },
//   nearbyText: { flex: 1 },
//   nearbyTitle: {
//     fontSize: FONT_SIZES.base,
//     fontWeight: FONT_WEIGHTS.semibold,
//     color: COLORS.text,
//   },
//   nearbySubtitle: {
//     fontSize: FONT_SIZES.sm,
//     color: COLORS.textMuted,
//     marginTop: 2,
//   },
// });
