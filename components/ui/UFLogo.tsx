import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Defs,
  Path,
  Circle,
  LinearGradient,
  Stop,
  Rect,
} from "react-native-svg";
import { COLORS, SHADOWS } from "@/constants/theme";

interface UFLogoProps {
  size?: number;
  variant?: "light" | "dark";
}

// Flat, geometric brand mark: a uniform-stroke "U" with the wordmark-orange
// dot. Deliberately restrained — one subtle gradient, no gloss/sheen layers.
export default function UFLogo({
  size = 88,
  variant = "light",
}: UFLogoProps): React.ReactElement {
  const r = size * 0.24;
  const rxView = r * (100 / size);

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
          <LinearGradient id="uf-tile" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#4E0710" />
            <Stop offset="1" stopColor="#2C0006" />
          </LinearGradient>
        </Defs>

        <Rect
          x="0"
          y="0"
          width="100"
          height="100"
          rx={rxView}
          ry={rxView}
          fill={variant === "light" ? "url(#uf-tile)" : COLORS.accent}
        />

        {/* Hairline inner border for edge definition without gloss */}
        <Rect
          x="0.75"
          y="0.75"
          width="98.5"
          height="98.5"
          rx={rxView - 0.75}
          ry={rxView - 0.75}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.08"
          strokeWidth="1.5"
        />

        {/* Uniform-weight "U" with rounded terminals */}
        <Path
          d="M35 27 L35 55 C35 64.5 41.5 71 50 71 C58.5 71 65 64.5 65 55 L65 27"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* Brand accent dot — echoes the wordmark highlight */}
        <Circle cx="78" cy="23" r="5" fill={COLORS.wordmarkHighlight} />
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
