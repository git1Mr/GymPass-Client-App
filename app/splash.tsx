// Brand splash in the landing "SaaS Futuristic" aesthetic: aurora canvas, the
// Unity Fitness mark with a violet glow, an eyebrow label, a gradient headline,
// and a glowing CTA. Auto-advances after the intro animation; the button skips.

import { COLORS, FONTS, FONT_SIZES, GRADIENTS, RADIUS, SPACING } from "@/constants/theme";
import React, { JSX, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuroraBackground from "@/components/ui/AuroraBackground";
import Eyebrow from "@/components/ui/Eyebrow";
import GradientFill from "@/components/ui/GradientFill";
import GradientText from "@/components/ui/GradientText";
import UnityLogo from "@/components/ui/UnityLogo";

export default function SplashScreen({
  onFinish,
}: {
  onFinish: () => void;
}): JSX.Element {
  const markOpacity = useRef(new Animated.Value(0)).current;
  const markScale = useRef(new Animated.Value(0.82)).current;
  const copyOpacity = useRef(new Animated.Value(0)).current;
  const copyTranslate = useRef(new Animated.Value(14)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const finished = useRef(false);

  function finish(): void {
    if (finished.current) return;
    finished.current = true;
    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 400,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onFinish());
  }

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(markOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(markScale, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(copyOpacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(copyTranslate, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1700),
    ]).start(() => finish());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <AuroraBackground />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.center}>
          <Animated.View
            style={{
              opacity: markOpacity,
              transform: [{ scale: markScale }],
              marginBottom: SPACING.xl,
            }}
          >
            <UnityLogo size={84} showWordmark={false} />
          </Animated.View>

          <Animated.View
            style={[
              styles.copy,
              { opacity: copyOpacity, transform: [{ translateY: copyTranslate }] },
            ]}
          >
            <Eyebrow style={styles.eyebrow}>Passeport Réseau Mondial</Eyebrow>
            <Text style={styles.title}>La Clé Mondiale</Text>
            <GradientText
              colors={[...GRADIENTS.text]}
              style={styles.titleAccent}
            >
              du Fitness.
            </GradientText>
            <Text style={styles.tagline}>
              Un seul pass flexible pour toutes les salles,{"\n"}studios et centres
              de fitness de votre ville. Sans engagement.
            </Text>
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: copyOpacity }}>
          <Pressable style={styles.cta} onPress={finish}>
            <GradientFill colors={GRADIENTS.primary} />
            <Text style={styles.ctaText}>Commencer</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, overflow: "hidden" },
  safe: { flex: 1, paddingHorizontal: SPACING.lg },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  copy: { alignItems: "center" },
  eyebrow: { marginBottom: SPACING.md },
  title: {
    fontSize: FONT_SIZES.hero,
    fontFamily: FONTS.display,
    color: COLORS.text,
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: FONT_SIZES.hero + 4,
  },
  titleAccent: {
    fontSize: FONT_SIZES.hero,
    fontFamily: FONTS.display,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 24,
    marginTop: SPACING.lg,
  },

  cta: {
    height: 56,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 10,
  },
  ctaText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semibold,
    color: COLORS.textOnPrimary,
  },
});
