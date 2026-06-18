import React, { JSX, useRef } from "react";
import {
    ActivityIndicator,
    Animated,
    Pressable,
    StyleSheet,
    Text,
    ViewStyle,
} from "react-native";
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    GRADIENTS,
    RADIUS,
} from "@/constants/theme";
import GradientFill from "./GradientFill";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** "primary" = violet gradient + glow; "secondary" = glass outline pill. */
  variant?: "primary" | "secondary";
  style?: ViewStyle;
}

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: PrimaryButtonProps): JSX.Element {
  const scale = useRef(new Animated.Value(1)).current;
  const secondary = variant === "secondary";

  function handlePressIn(): void {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  }
  function handlePressOut(): void {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  }

  return (
    <Animated.View
      style={[
        { transform: [{ scale }] },
        secondary ? styles.secondaryShadow : styles.shadow,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.btn,
          secondary && styles.secondaryBtn,
          (disabled || loading) && styles.disabled,
        ]}
      >
        {!secondary && <GradientFill colors={GRADIENTS.primary} />}
        {loading ? (
          <ActivityIndicator color={secondary ? COLORS.primaryLight : COLORS.textOnPrimary} />
        ) : (
          <Text style={[styles.label, secondary && styles.secondaryLabel]}>
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Shadow lives on the outer wrapper: the Pressable clips to the pill for the
  // gradient, and Android drops shadows on overflow:"hidden" views.
  shadow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 10,
    borderRadius: RADIUS.full,
  },
  secondaryShadow: { borderRadius: RADIUS.full },
  btn: {
    borderRadius: RADIUS.full,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  secondaryBtn: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabled: { opacity: 0.5 },
  label: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semibold,
    color: COLORS.textOnPrimary,
    letterSpacing: 0.2,
  },
  secondaryLabel: { color: COLORS.text },
});
