// app/(tabs)/explore.tsx
// Map of partner gyms using react-native-maps.
// Prominent "Discover our partners" overlay button.

import {
    COLORS,
    FONT_SIZES,
    FONT_WEIGHTS,
    RADIUS,
    SHADOWS,
    SPACING,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gym } from "@/types";

// ── Placeholder data until gymService is wired up ──────────────────────────
const MOCK_GYMS: (Gym & {
  coordinate: { latitude: number; longitude: number };
})[] = [
  {
    _id: "1",
    name: "FitClub Casablanca",
    city: "Casablanca",
    tier: 2,
    pointsPerSession: 3,
    equipment: [],
    description: "",
    status: "active",
    location: { type: "Point", coordinates: [-7.589843, 33.573109] },
    coordinate: { latitude: 33.573109, longitude: -7.589843 },
  },
  {
    _id: "2",
    name: "EliteGym Rabat",
    city: "Rabat",
    tier: 3,
    pointsPerSession: 5,
    equipment: [],
    description: "",
    status: "active",
    location: { type: "Point", coordinates: [-6.849813, 33.991741] },
    coordinate: { latitude: 33.991741, longitude: -6.849813 },
  },
  {
    _id: "3",
    name: "Standard Fit Tangier",
    city: "Tangier",
    tier: 1,
    pointsPerSession: 1,
    equipment: [],
    description: "",
    status: "active",
    location: { type: "Point", coordinates: [-5.833954, 35.759465] },
    coordinate: { latitude: 35.759465, longitude: -5.833954 },
  },
];

const TIER_COLORS: Record<number, string> = {
  1: COLORS.primary,
  2: "#F59E0B",
  3: COLORS.accent,
};

const INITIAL_REGION: Region = {
  latitude: 33.573109,
  longitude: -7.589843,
  latitudeDelta: 4.5,
  longitudeDelta: 4.5,
};

export default function ExploreScreen() {
  const mapRef = useRef<MapView>(null);
  const [loading, setLoading] = useState(true);
  const [gyms, setGyms] = useState(MOCK_GYMS);
  const [selected, setSelected] = useState<(typeof MOCK_GYMS)[0] | null>(null);
  const [filterTier, setFilterTier] = useState<number | null>(null);

  useEffect(() => {
    // Swap with gymService.getGyms() when backend is connected
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = filterTier
    ? gyms.filter((g) => g.tier === filterTier)
    : gyms;

  function fitToGyms() {
    mapRef.current?.fitToCoordinates(
      filtered.map((g) => g.coordinate),
      {
        edgePadding: { top: 80, right: 40, bottom: 200, left: 40 },
        animated: true,
      },
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Page header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSub}>{filtered.length} partner clubs</Text>
      </View>

      <View style={styles.mapWrap}>
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          showsUserLocation
          showsCompass={false}
        >
          {filtered.map((gym) => (
            <Marker
              key={gym._id}
              coordinate={gym.coordinate}
              onPress={() => setSelected(gym)}
            >
              <View
                style={[styles.pin, { backgroundColor: TIER_COLORS[gym.tier] }]}
              >
                <Ionicons
                  name="barbell-outline"
                  size={14}
                  color={COLORS.white}
                />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* ── Tier filter chips ── */}
        <View style={styles.filterRow}>
          {[null, 1, 2, 3].map((t) => (
            <TouchableOpacity
              key={String(t)}
              style={[styles.chip, filterTier === t && styles.chipActive]}
              onPress={() => setFilterTier(t)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.chipText,
                  filterTier === t && styles.chipTextActive,
                ]}
              >
                {t === null ? "All" : `Tier ${t}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── "Discover our partners" overlay button ── */}
        <View style={styles.overlayWrap}>
          <TouchableOpacity
            style={styles.overlayBtn}
            onPress={fitToGyms}
            activeOpacity={0.85}
          >
            <Ionicons name="compass" size={20} color={COLORS.white} />
            <Text style={styles.overlayText}>Discover our partners</Text>
          </TouchableOpacity>
        </View>

        {/* ── Selected gym bottom sheet ── */}
        {selected && (
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetName}>{selected.name}</Text>
                <Text style={styles.sheetCity}>{selected.city}</Text>
              </View>
              <View
                style={[
                  styles.tierBadge,
                  { backgroundColor: TIER_COLORS[selected.tier] },
                ]}
              >
                <Text style={styles.tierText}>Tier {selected.tier}</Text>
              </View>
            </View>
            <View style={styles.sheetRow}>
              <Ionicons name="flash" size={16} color={COLORS.accent} />
              <Text style={styles.sheetPoints}>
                {selected.pointsPerSession} pts / session
              </Text>
            </View>
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.sheetBtn}
                onPress={() => setSelected(null)}
              >
                <Text style={styles.sheetBtnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetBtn, styles.sheetBtnPrimary]}
              >
                <Text style={[styles.sheetBtnText, { color: COLORS.white }]}>
                  Check in here
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  headerSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  mapWrap: { flex: 1, position: "relative" },
  map: { flex: 1 },
  loader: {
    ...StyleSheet.absoluteFill, //modification
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.card,
  },

  filterRow: {
    position: "absolute",
    top: SPACING.md,
    left: SPACING.md,
    flexDirection: "row",
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  chipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  chipTextActive: { color: COLORS.white },

  overlayWrap: {
    position: "absolute",
    bottom: SPACING.xxl,
    left: SPACING.lg,
    right: SPACING.lg,
    alignItems: "center",
  },
  overlayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
    ...SHADOWS.card,
  },
  overlayText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: SPACING.md,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  sheetName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  sheetCity: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: 2 },
  tierBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  tierText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  sheetPoints: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  sheetActions: { flexDirection: "row", gap: SPACING.sm },
  sheetBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sheetBtnPrimary: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  sheetBtnText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
});

// // app/(tabs)/explore.tsx  →  "/explore" route (Gym explorer)

// import { COLORS, FONT_SIZES, SPACING } from "@/constants/theme";
// import React, { JSX } from "react";
// import { StyleSheet, Text, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function ExploreScreen(): JSX.Element {
//   return (
//     <SafeAreaView style={styles.safe}>
//       <View style={styles.container}>
//         <Text style={styles.emoji}>🗺️</Text>
//         <Text style={styles.title}>Find gyms near you</Text>
//         <Text style={styles.subtitle}>Gym explorer coming soon.</Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: COLORS.background },
//   container: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: SPACING.lg,
//   },
//   emoji: { fontSize: 48, marginBottom: SPACING.lg },
//   title: {
//     fontSize: FONT_SIZES.xl,
//     color: COLORS.text,
//     marginBottom: SPACING.sm,
//   },
//   subtitle: { fontSize: FONT_SIZES.base, color: COLORS.textSecondary },
// });
