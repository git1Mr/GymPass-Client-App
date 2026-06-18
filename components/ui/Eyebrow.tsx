import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

import { COLORS, FONTS } from "@/constants/theme";

interface EyebrowProps {
  children: string;
  /** Defaults to the bright violet used for section eyebrows on the landing. */
  color?: string;
  style?: TextStyle;
}

// Small uppercase DM Mono label with wide tracking — the landing's section
// eyebrow (e.g. "TARIFS", "PASSEPORT RÉSEAU MONDIAL").
export default function Eyebrow({
  children,
  color = COLORS.primaryLight,
  style,
}: EyebrowProps): React.ReactElement {
  return <Text style={[styles.label, { color }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
});
