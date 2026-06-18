import { Ionicons } from "@expo/vector-icons";
import React, { JSX } from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { COLORS } from "@/constants/theme";

interface CircleIconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  style?: ViewStyle;
}

// CaFit header chrome: a thin-outlined circle around a small icon, used for
// back arrows and overflow menus on every screen of the kit.
export default function CircleIconButton({
  icon,
  onPress,
  size = 48,
  iconSize = 20,
  style,
}: CircleIconButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        styles.btn,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Ionicons name={icon} size={iconSize} color={COLORS.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
