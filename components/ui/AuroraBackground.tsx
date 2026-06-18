import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  Ellipse,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import { COLORS } from "@/constants/theme";

interface AuroraBackgroundProps {
  /** Slow drift animation. Disable for static screens / reduced motion. */
  animated?: boolean;
}

const AnimatedView = Animated.View;

// Violet/magenta aurora mesh — the RN counterpart of the landing's
// `body::before` radial blooms over the deep purple-black canvas. Soft
// radial-gradient ellipses (no blur needed) drift slowly behind every screen.
// Absolutely positioned + pointerEvents="none" so foreground UI stays live.
export default function AuroraBackground({
  animated = true,
}: AuroraBackgroundProps): React.ReactElement {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 13000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 13000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [animated, drift]);

  const translateY = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22],
  });
  const translateX = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  });
  const scale = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <View style={styles.fill} pointerEvents="none">
      {/* Solid canvas base */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.background }]} />
      <AnimatedView
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX }, { translateY }, { scale }] },
        ]}
      >
        <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
          <Defs>
            <RadialGradient id="a1" cx="16%" cy="6%" rx="60%" ry="50%">
              <Stop offset="0" stopColor={COLORS.primary} stopOpacity={0.4} />
              <Stop offset="0.7" stopColor={COLORS.primary} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="a2" cx="88%" cy="12%" rx="52%" ry="46%">
              <Stop offset="0" stopColor={COLORS.magenta} stopOpacity={0.28} />
              <Stop offset="0.7" stopColor={COLORS.magenta} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="a3" cx="78%" cy="74%" rx="62%" ry="54%">
              <Stop offset="0" stopColor={COLORS.indigo} stopOpacity={0.26} />
              <Stop offset="0.72" stopColor={COLORS.indigo} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="a4" cx="24%" cy="94%" rx="64%" ry="56%">
              <Stop offset="0" stopColor={COLORS.primaryDark} stopOpacity={0.2} />
              <Stop offset="0.74" stopColor={COLORS.primaryDark} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="-20%" y="-20%" width="140%" height="140%" fill="url(#a1)" />
          <Rect x="-20%" y="-20%" width="140%" height="140%" fill="url(#a2)" />
          <Rect x="-20%" y="-20%" width="140%" height="140%" fill="url(#a3)" />
          <Rect x="-20%" y="-20%" width="140%" height="140%" fill="url(#a4)" />
          {/* Faint central bloom keeps the very middle from going flat. */}
          <Ellipse cx="50%" cy="42%" rx="46%" ry="32%" fill="url(#a1)" opacity={0.5} />
        </Svg>
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
});
