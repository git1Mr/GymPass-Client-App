// app/splash.tsx
//
// Animated entry screen. Dark canvas, animated light pillar in the
// background, and a staggered logo / wordmark / tagline reveal. The
// pillar component handles its own breathing/drift loops; this file
// owns the entry choreography + fade-out handoff.

import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from "@/constants/theme";
import React, { JSX, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

import LightPillar from "@/components/ui/LightPillar";
import UFLogo from "@/components/ui/UFLogo";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function SplashScreen({
  onFinish,
}: {
  onFinish: () => void;
}): JSX.Element {
  // Entry animation values
  const pillarOpacity = useRef(new Animated.Value(0)).current;
  const pillarScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordTranslate = useRef(new Animated.Value(12)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  // Fade-out handoff
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Pillar materializes
      Animated.parallel([
        Animated.timing(pillarOpacity, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pillarScale, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 2. Logo pops
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      // 3. Wordmark slides
      Animated.parallel([
        Animated.timing(wordOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(wordTranslate, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 4. Tagline whispers in
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // 5. Hold
      Animated.delay(1100),
      // 6. Hand off
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* ── Light pillar background ── */}
      <Animated.View
        style={[
          styles.pillarLayer,
          {
            opacity: pillarOpacity,
            transform: [{ scale: pillarScale }],
          },
        ]}
        pointerEvents="none"
      >
        <LightPillar
          width={SCREEN_W}
          height={SCREEN_H}
          seed="A"
          animated
        />
      </Animated.View>

      {/* ── Bottom vignette to deepen the floor ── */}
      <View style={styles.vignette} pointerEvents="none" />

      {/* ── Logo + text ── */}
      <View style={styles.content}>
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <UFLogo size={88} variant="light" />
        </Animated.View>

        <Animated.Text
          style={[
            styles.wordmark,
            {
              opacity: wordOpacity,
              transform: [{ translateY: wordTranslate }],
            },
          ]}
        >
          UNITYFITNESS
        </Animated.Text>

        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          Train anywhere · Pay for what you use
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0A1F",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pillarLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    // Subtle radial darkening at the bottom — emulated as a flat tint
    // because RN can't do radial gradients in core. Layered above pillar
    // so the floor reads dark and the headline lifts off.
    shadowColor: "#0E0A1F",
    shadowOpacity: 0.6,
    shadowRadius: 200,
    shadowOffset: { width: 0, height: 120 },
  },
  content: {
    alignItems: "center",
    zIndex: 10,
    paddingHorizontal: SPACING.lg,
  },
  wordmark: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.black,
    color: "#FFFFFF",
    letterSpacing: 6,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 0.5,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
