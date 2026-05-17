import {
    COLORS,
    FONT_SIZES,
    FONT_WEIGHTS,
    RADIUS,
    SHADOWS,
    SPACING,
} from "@/constants/theme";
import { Gym } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
    Circle,
    Defs,
    G,
    Line,
    LinearGradient,
    Rect,
    Stop,
    Text as SvgText,
} from "react-native-svg";

const { width: SCREEN_W } = Dimensions.get("window");

type GymWithCoord = Gym & {
  coordinate: { latitude: number; longitude: number };
};

const MOCK_GYMS: GymWithCoord[] = [
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

const BOUNDS = {
  west: -13.5,
  east: -1.0,
  south: 27.0,
  north: 36.5,
};

const CITIES: { name: string; lat: number; lon: number }[] = [
  { name: "Tangier", lat: 35.7595, lon: -5.834 },
  { name: "Rabat", lat: 34.0209, lon: -6.841 },
  { name: "Casablanca", lat: 33.5731, lon: -7.589 },
  { name: "Fes", lat: 34.0181, lon: -5.007 },
  { name: "Marrakech", lat: 31.6295, lon: -7.989 },
  { name: "Agadir", lat: 30.4278, lon: -9.598 },
  { name: "Oujda", lat: 34.6814, lon: -1.908 },
];

export default function ExploreScreen() {
  const [loading, setLoading] = useState(true);
  const [gyms] = useState(MOCK_GYMS);
  const [selected, setSelected] = useState<GymWithCoord | null>(null);
  const [filterTier, setFilterTier] = useState<number | null>(null);

  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomAnim = useRef(new Animated.Value(1)).current;
  const [mapSize, setMapSize] = useState({ width: SCREEN_W, height: 600 });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    Animated.spring(zoomAnim, {
      toValue: zoomLevel,
      useNativeDriver: true,
      friction: 7,
    }).start();
  }, [zoomLevel, zoomAnim]);

  const filtered = useMemo(
    () => (filterTier ? gyms.filter((g) => g.tier === filterTier) : gyms),
    [filterTier, gyms],
  );

  const project = useCallback(
    (lat: number, lon: number) => {
      const x =
        ((lon - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * mapSize.width;

      const y =
        ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * mapSize.height;
      return { x, y };
    },
    [mapSize],
  );

  function zoom(factor: number) {
    setZoomLevel((z) => Math.max(0.6, Math.min(3, z + factor * 0.3)));
  }

  function fitToGyms() {
    setZoomLevel(1);
  }

  const baseLayer = useMemo(() => {
    const GRID_STEP = 40;
    const lines: React.ReactNode[] = [];
    for (let x = 0; x <= mapSize.width; x += GRID_STEP) {
      lines.push(
        <Line
          key={`v${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={mapSize.height}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
        />,
      );
    }
    for (let y = 0; y <= mapSize.height; y += GRID_STEP) {
      lines.push(
        <Line
          key={`h${y}`}
          x1={0}
          y1={y}
          x2={mapSize.width}
          y2={y}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
        />,
      );
    }
    return lines;
  }, [mapSize]);

  const cityLayer = useMemo(
    () =>
      CITIES.map((c) => {
        const { x, y } = project(c.lat, c.lon);
        return (
          <G key={c.name}>
            <Circle cx={x} cy={y} r={2.5} fill="rgba(255,255,255,0.35)" />
            <SvgText
              x={x + 6}
              y={y + 4}
              fill="rgba(255,255,255,0.45)"
              fontSize={10}
              fontWeight="600"
            >
              {c.name}
            </SvgText>
          </G>
        );
      }),
    [project],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Page header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSub}>
          {filtered.length} partner club{filtered.length === 1 ? "" : "s"} ·
          mock map (no API key)
        </Text>
      </View>

      <View
        style={styles.mapWrap}
        onLayout={(e) =>
          setMapSize({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          })
        }
      >
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        <Animated.View
          style={[styles.svgWrap, { transform: [{ scale: zoomAnim }] }]}
        >
          <Svg width={mapSize.width} height={mapSize.height}>
            <Defs>
              <LinearGradient id="mapBg" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#0E0A1F" />
                <Stop offset="100%" stopColor="#13121C" />
              </LinearGradient>
            </Defs>
            <Rect
              x={0}
              y={0}
              width={mapSize.width}
              height={mapSize.height}
              fill="url(#mapBg)"
            />
            {baseLayer}
            {cityLayer}

            {/* Gym pins */}
            {filtered.map((gym) => {
              const { x, y } = project(
                gym.coordinate.latitude,
                gym.coordinate.longitude,
              );
              return (
                <G key={gym._id}>
                  {/* Halo */}
                  <Circle
                    cx={x}
                    cy={y}
                    r={14}
                    fill={TIER_COLORS[gym.tier]}
                    fillOpacity={0.18}
                  />
                  {/* Pin */}
                  <Circle
                    cx={x}
                    cy={y}
                    r={7}
                    fill={TIER_COLORS[gym.tier]}
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                  />
                </G>
              );
            })}
          </Svg>

          {/* Touchable overlay for each pin — SVG doesn't fire press events */}
          {filtered.map((gym) => {
            const { x, y } = project(
              gym.coordinate.latitude,
              gym.coordinate.longitude,
            );
            return (
              <TouchableOpacity
                key={`hit-${gym._id}`}
                onPress={() => setSelected(gym)}
                style={[styles.hitArea, { left: x - 18, top: y - 18 }]}
                activeOpacity={0.7}
              />
            );
          })}
        </Animated.View>

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

        {/* ── Zoom controls (bottom-right) ── */}
        <View style={styles.zoomCol} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => zoom(+1)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => zoom(-1)}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={20} color={COLORS.text} />
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
  headerSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: 2 },

  mapWrap: {
    flex: 1,
    position: "relative",
    backgroundColor: "#0E0A1F",
    overflow: "hidden",
  },
  svgWrap: { ...StyleSheet.absoluteFillObject },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  hitArea: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "transparent",
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
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
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

  zoomCol: {
    position: "absolute",
    right: SPACING.md,
    bottom: SPACING.xxl + 60,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    ...SHADOWS.card,
  },
  zoomBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomDivider: { height: 1, backgroundColor: COLORS.border },

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
