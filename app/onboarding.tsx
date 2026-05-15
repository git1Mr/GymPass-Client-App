// app/onboarding.tsx
// 3-slide intro carousel shown before login.
// Navigate here by calling router.replace("/onboarding") on first launch.

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

const { width: W } = Dimensions.get("window");

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface Slide {
  icon: IoniconsName;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: "barbell-outline",
    title: "Train Anywhere",
    body: "Access 50+ partner gyms across Morocco with a single pass.",
  },
  {
    icon: "flash-outline",
    title: "Pay As You Go",
    body: "Buy points once. Use them across all partner locations. No monthly fees.",
  },
  {
    icon: "phone-portrait-outline",
    title: "Scan & Check In",
    body: "Show your mobile pass at any partner gym. No cards, no hassle.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [current, setCurrent] = useState(0);
  const isLast = current === SLIDES.length - 1;

  function advance() {
    if (isLast) {
      router.replace("/(auth)/login");
    } else {
      const next = current + 1;
      scrollRef.current?.scrollTo({ x: W * next, animated: true });
      setCurrent(next);
    }
  }

  function onScroll(e: { nativeEvent: { contentOffset: { x: number } } }) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    if (idx !== current) setCurrent(idx);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Full-screen silk gradient */}
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient id="onbGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="1" />
            <Stop offset="50%" stopColor={COLORS.primaryDark} stopOpacity="1" />
            <Stop offset="100%" stopColor={COLORS.accent} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#onbGrad)" />
      </Svg>

      {/* Decorative blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      {/* Skip button */}
      {!isLast && (
        <Pressable
          style={styles.skipBtn}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      {/* Slide pager */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={styles.pager}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={styles.slide}>
            <View style={styles.iconCircle}>
              <Ionicons name={slide.icon} size={52} color={COLORS.white} />
            </View>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideBody}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === current && styles.dotActive]}
          />
        ))}
      </View>

      {/* Next / Get Started */}
      <Pressable style={styles.nextBtn} onPress={advance}>
        <Text style={styles.nextText}>
          {isLast ? "Get Started" : "Next"}
        </Text>
        <Ionicons name="arrow-forward" size={18} color={COLORS.accent} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.accent },

  blobTopRight: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.35,
  },
  blobBottomLeft: {
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.accentLight,
    opacity: 0.45,
  },

  skipBtn: {
    position: "absolute",
    top: SPACING.lg,
    right: SPACING.lg,
    zIndex: 10,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  skipText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },

  pager: { flex: 1 },
  slide: {
    width: W,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl + SPACING.sm,
  },
  slideTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: SPACING.md,
  },
  slideBody: {
    fontSize: FONT_SIZES.base,
    color: "rgba(255,255,255,0.78)",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: {
    width: 22,
    backgroundColor: COLORS.white,
    borderRadius: 3,
  },

  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    ...SHADOWS.soft,
  },
  nextText: {
    color: COLORS.accent,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.base,
  },
});
