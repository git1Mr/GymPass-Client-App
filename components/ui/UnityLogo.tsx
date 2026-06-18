import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

import { COLORS, FONTS } from "@/constants/theme";

interface UnityLogoProps {
  /** Icon-mark edge length. Wordmark scales relative to it. */
  size?: number;
  /** Show the "Unity Fitness" / "Réseau" wordmark beside the mark. */
  showWordmark?: boolean;
  style?: ViewStyle;
}

/**
 * Unity Fitness logo lockup — ported from the landing app's UnityLogo.
 * A rounded-square mark holding a continuous single-stroke "UF" glyph in
 * bright violet, optionally followed by the "Unity Fitness" wordmark with a
 * "Réseau" mono sub-label. Identical mark across splash, auth, and headers.
 */
export default function UnityLogo({
  size = 40,
  showWordmark = true,
  style,
}: UnityLogoProps): React.ReactElement {
  const glyph = size * 0.65;
  return (
    <View style={[styles.row, style]}>
      <View
        style={[
          styles.mark,
          { width: size, height: size, borderRadius: size * 0.28 },
        ]}
      >
        <Svg width={glyph} height={glyph} viewBox="0 0 26 26" fill="none">
          {/* U left arm → base curve → right arm */}
          <Path
            d="M4 3 L4 16 Q4 21 9 21 Q14 21 14 16 L14 3"
            stroke={COLORS.primaryLight}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* F top bar */}
          <Path
            d="M14 3 L22 3"
            stroke={COLORS.primaryLight}
            strokeWidth={1.8}
            strokeLinecap="round"
            fill="none"
          />
          {/* F mid crossbar */}
          <Path
            d="M14 11 L20 11"
            stroke={COLORS.primaryLight}
            strokeWidth={1.8}
            strokeLinecap="round"
            fill="none"
          />
          {/* Fine base tick */}
          <Path
            d="M7 21 L11 21"
            stroke="#E9DFFF"
            strokeWidth={0.8}
            strokeLinecap="round"
            fill="none"
            opacity={0.5}
          />
        </Svg>
      </View>

      {showWordmark && (
        <View style={styles.wordmark}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { fontSize: size * 0.4 }]}>Unity</Text>
            <Text style={[styles.nameAccent, { fontSize: size * 0.4 }]}>
              Fitness
            </Text>
          </View>
          <Text style={[styles.sub, { fontSize: size * 0.2 }]}>RÉSEAU</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  mark: {
    backgroundColor: COLORS.surfaceSolid,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    // Violet glow under the mark.
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 6,
  },
  wordmark: { gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "baseline" },
  name: {
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  nameAccent: {
    fontFamily: FONTS.bold,
    color: COLORS.primaryLight,
    letterSpacing: -0.4,
  },
  sub: {
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
    letterSpacing: 3,
  },
});
