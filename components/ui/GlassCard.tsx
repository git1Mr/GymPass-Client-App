import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";

import { COLORS, RADIUS } from "@/constants/theme";

interface GlassCardProps extends ViewProps {
  /** Featured surface: violet ring + magenta glow + brighter wash. */
  highlighted?: boolean;
  radius?: number;
  /** Blur strength (expo-blur intensity). */
  intensity?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

// Glassmorphic card — the landing's `.uf-glass`: a frosted translucent panel
// over the aurora canvas with a hairline border. Uses expo-blur for the frost;
// the translucent tint + border survive even where blur is unsupported.
export default function GlassCard({
  highlighted = false,
  radius = RADIUS.lg,
  intensity = 24,
  style,
  children,
  ...rest
}: GlassCardProps): React.ReactElement {
  return (
    <View
      style={[
        styles.shell,
        {
          borderRadius: radius,
          borderColor: highlighted ? COLORS.primary : COLORS.border,
        },
        highlighted ? styles.ring : styles.depth,
        style,
      ]}
      {...rest}
    >
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
      {/* Translucent wash over the blur — brighter when highlighted. */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            backgroundColor: highlighted ? COLORS.primaryMuted : COLORS.glass,
          },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    borderWidth: 1,
  },
  content: { position: "relative" },
  depth: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 6,
  },
  ring: {
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.5,
    shadowRadius: 36,
    elevation: 10,
  },
});
