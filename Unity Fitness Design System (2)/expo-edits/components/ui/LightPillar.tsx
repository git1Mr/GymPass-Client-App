// components/ui/LightPillar.tsx
//
// A vertical "light pillar" background — a stylized streak of lavender
// light against a dark surface. Replaces the brand's circular blob
// motif on hero panels (splash, auth header, QR sheet).
//
// react-native-svg does not consistently support feGaussianBlur on
// device, so the glow is faked by layering multiple stroke paths at
// decreasing widths and increasing core brightness. The composite reads
// as soft → bright → soft from outside in.
//
// Animation: when `animated` is true, the inner layers breathe (slow
// opacity loop) and the core highlight slowly drifts vertically. The
// effect is calm — not flashy — and is meant to play under content,
// not compete with it.

import {
  COLORS,
} from "@/constants/theme";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface LightPillarProps {
  /** Width of the rendered SVG canvas. Pillar scales to fill. */
  width?: number;
  /** Height of the rendered SVG canvas. */
  height?: number;
  /** Variant: "A" curves top-right→bottom-left, "B" is a near-vertical twin streak. */
  seed?: "A" | "B";
  /** Drive the breath/drift loops. Defaults to true. */
  animated?: boolean;
  /** Background color underneath the pillar. */
  bg?: string;
}

// Two stylized centerlines roughly matching the reference photo.
const PATHS: Record<"A" | "B", { main: string; branch: string }> = {
  A: {
    main: "M 320 -40 C 220 60, 340 220, 220 380",
    branch: "M 270 -20 C 250 100, 290 200, 260 360",
  },
  B: {
    main: "M 220 -40 C 160 120, 260 220, 180 460",
    branch: "M 260 40 C 220 140, 280 260, 240 440",
  },
};

export default function LightPillar({
  width = 400,
  height = 400,
  seed = "A",
  animated = true,
  bg = "#0E0A1F",
}: LightPillarProps): React.ReactElement {
  const breathe = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false, // we drive opacity on AnimatedPath
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );

    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );

    breatheLoop.start();
    driftLoop.start();

    return () => {
      breatheLoop.stop();
      driftLoop.stop();
    };
  }, [animated]);

  const innerOpacity = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1],
  });
  const coreOpacity = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0.95],
  });
  const coreWidth = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 3.4],
  });

  const p = PATHS[seed];
  const vbHeight = seed === "A" ? 380 : 460;

  return (
    <View style={[styles.wrap, { width, height, backgroundColor: bg }]}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 400 ${vbHeight}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <SvgLinearGradient id={`pillar-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"    stopColor={COLORS.primaryLight} stopOpacity="0" />
            <Stop offset="0.20" stopColor={COLORS.primaryLight} stopOpacity="0.55" />
            <Stop offset="0.50" stopColor={COLORS.primary}      stopOpacity="0.85" />
            <Stop offset="0.82" stopColor={COLORS.primaryDark}  stopOpacity="0.55" />
            <Stop offset="1"    stopColor={COLORS.accent}       stopOpacity="0" />
          </SvgLinearGradient>
          <SvgLinearGradient id={`core-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"    stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.85" />
            <Stop offset="0.55" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="0.85" stopColor="#FFFFFF" stopOpacity="0.5" />
            <Stop offset="1"    stopColor="#FFFFFF" stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>

        {/* Layer 1 — broadest halo */}
        <Path
          d={p.main}
          stroke={`url(#pillar-${seed})`}
          strokeWidth={240}
          strokeLinecap="round"
          fill="none"
          opacity={0.35}
        />
        {/* Layer 2 — branching halo */}
        <Path
          d={p.branch}
          stroke={`url(#pillar-${seed})`}
          strokeWidth={140}
          strokeLinecap="round"
          fill="none"
          opacity={0.28}
        />
        {/* Layer 3 — mid glow (breathes) */}
        <AnimatedPath
          d={p.main}
          stroke={`url(#pillar-${seed})`}
          strokeWidth={110}
          strokeLinecap="round"
          fill="none"
          opacity={innerOpacity}
        />
        {/* Layer 4 — tight glow */}
        <Path
          d={p.main}
          stroke={`url(#pillar-${seed})`}
          strokeWidth={50}
          strokeLinecap="round"
          fill="none"
          opacity={0.95}
        />
        {/* Layer 5 — inner haze */}
        <Path
          d={p.main}
          stroke={`url(#pillar-${seed})`}
          strokeWidth={22}
          strokeLinecap="round"
          fill="none"
          opacity={1}
        />
        {/* Layer 6 — bright core (drifts in width) */}
        <AnimatedPath
          d={p.main}
          stroke={`url(#core-${seed})`}
          strokeWidth={coreWidth as unknown as number}
          strokeLinecap="round"
          fill="none"
          opacity={coreOpacity}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
});
