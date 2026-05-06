// app/splash.tsx
// Pure animated entry screen — no auth dependency.
// Imported directly by app/_layout.tsx before AuthProvider mounts.

import {
    COLORS,
    FONTS,
    FONT_SIZES,
    FONT_WEIGHTS,
    SPACING,
} from "@/constants/theme";
import Constants from "expo-constants";
import React, { JSX, useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface SplashScreenProps {
  onFinish: () => void;
}

const { width } = Dimensions.get("window");
const VERSION: string =
  (Constants.expoConfig?.version as string | undefined) ?? "1.0.0";

export default function SplashScreen({
  onFinish,
}: SplashScreenProps): JSX.Element {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(24)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const versionOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect((): void => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        delay: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(versionOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(900),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start((): void => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }],
            },
          ]}
        >
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Text style={styles.logoLetter}>G</Text>
            </View>
          </View>
          <Text style={styles.logoWordmark}>GYMPASS</Text>
        </Animated.View>

        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Train anywhere.{"\n"}Pay for what you use.
        </Animated.Text>
      </View>

      <Animated.Text style={[styles.version, { opacity: versionOpacity }]}>
        v{VERSION}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  glowTop: {
    position: "absolute",
    top: -80,
    left: width / 2 - 160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: COLORS.primary,
    opacity: 0.35,
  },
  glowBottom: {
    position: "absolute",
    bottom: -120,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.18,
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logoWrap: { alignItems: "center", marginBottom: SPACING.lg },
  logoOuter: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    marginBottom: SPACING.sm,
    transform: [{ rotate: "12deg" }],
  },
  logoInner: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 26,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.accent,
    fontFamily: FONTS.display,
    transform: [{ rotate: "-12deg" }],
  },
  logoWordmark: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
    letterSpacing: 6,
    fontFamily: FONTS.display,
  },
  tagline: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.5,
    marginTop: SPACING.sm,
  },
  version: {
    position: "absolute",
    bottom: SPACING.xl,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
  },
});
