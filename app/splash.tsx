import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from "@/constants/theme";
import React, { JSX, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
} from "react-native";

import DarkVeil from "@/components/ui/DarkVeil";
import UFLogo from "@/components/ui/UFLogo";

export default function SplashScreen({
  onFinish,
}: {
  onFinish: () => void;
}): JSX.Element {
  const pillarOpacity = useRef(new Animated.Value(0)).current;
  const pillarScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordTranslate = useRef(new Animated.Value(12)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
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
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(1100),
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
        <DarkVeil />
      </Animated.View>

      <View style={styles.vignette} pointerEvents="none" />

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
    // Emulates a radial darkening at the bottom — RN core can't do radial gradients.
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
