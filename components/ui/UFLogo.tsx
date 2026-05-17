import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Defs,
  Path,
  Circle,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
  ClipPath,
} from "react-native-svg";
import { COLORS, SHADOWS } from "@/constants/theme";

interface UFLogoProps {
  size?: number;
  variant?: "light" | "dark";
}

export default function UFLogo({
  size = 88,
  variant = "light",
}: UFLogoProps): React.ReactElement {
  const r = size * 0.24;
  const glossy = variant === "light";

  return (
    <View
      style={[
        styles.shell,
        {
          width: size,
          height: size,
          borderRadius: r,
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient
            id="uf-tile"
            cx="0.28"
            cy="0.22"
            r="0.95"
            fx="0.28"
            fy="0.22"
          >
            <Stop offset="0" stopColor="#8A1A28" />
            <Stop offset="0.45" stopColor="#5A0010" />
            <Stop offset="1" stopColor="#2A0006" />
          </RadialGradient>
          <LinearGradient id="uf-sheen" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" />
            <Stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.04" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="uf-rim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.35" />
            <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.35" />
          </LinearGradient>

          <ClipPath id="uf-clip">
            <Rect
              x="0"
              y="0"
              width="100"
              height="100"
              rx={r * (100 / size)}
              ry={r * (100 / size)}
            />
          </ClipPath>
        </Defs>

        <Rect
          x="0"
          y="0"
          width="100"
          height="100"
          rx={r * (100 / size)}
          ry={r * (100 / size)}
          fill={glossy ? "url(#uf-tile)" : COLORS.accent}
        />

        {glossy && (
          <>
            <Rect
              x="0"
              y="0"
              width="100"
              height="56"
              fill="url(#uf-sheen)"
              clipPath="url(#uf-clip)"
            />
            <Rect
              x="0"
              y="0"
              width="100"
              height="100"
              rx={r * (100 / size)}
              ry={r * (100 / size)}
              fill="none"
              stroke="url(#uf-rim)"
              strokeWidth="1.4"
            />
          </>
        )}

        <Path
          d="M28 18 L28 58 C28 73 38 81 50 81 C62 81 72 73 72 58 L72 18 L60 18 L60 58 C60 65 57 70 50 70 C43 70 40 65 40 58 L40 18 Z"
          fill="#FFFFFF"
        />

        <Circle cx="80" cy="22" r="6.2" fill="#FFFFFF" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    ...SHADOWS.pop,
    // overflow:visible lets the shadow render on Android (RN clips by default).
    overflow: "visible",
    backgroundColor: "transparent",
  },
});
