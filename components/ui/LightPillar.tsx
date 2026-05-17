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
  width?: number;
  height?: number;
  seed?: "A" | "B";
  animated?: boolean;
  bg?: string;
}

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

    // useNativeDriver: false because opacity is driven on AnimatedPath (SVG).
    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
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

        <Path
          d={p.main}
          stroke={`url(#pillar-${seed})`}
          strokeWidth={240}
          strokeLinecap="round"
          fill="none"
          opacity={0.35}
        />
        <Path
          d={p.branch}
          stroke={`url(#pillar-${seed})`}
          strokeWidth={140}
          strokeLinecap="round"
          fill="none"
          opacity={0.28}
        />
        <AnimatedPath
          d={p.main}
          stroke={`url(#pillar-${seed})`}
          strokeWidth={110}
          strokeLinecap="round"
          fill="none"
          opacity={innerOpacity}
        />
        <Path
          d={p.main}
          stroke={`url(#pillar-${seed})`}
          strokeWidth={50}
          strokeLinecap="round"
          fill="none"
          opacity={0.95}
        />
        <Path
          d={p.main}
          stroke={`url(#pillar-${seed})`}
          strokeWidth={22}
          strokeLinecap="round"
          fill="none"
          opacity={1}
        />
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
