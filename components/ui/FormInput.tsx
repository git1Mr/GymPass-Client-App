import { Ionicons } from "@expo/vector-icons";
import React, { JSX, useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    RADIUS,
    SPACING,
} from "@/constants/theme";

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export default function FormInput({
  label,
  error,
  rightIcon,
  onRightIconPress,
  containerStyle,
  ...inputProps
}: FormInputProps): JSX.Element {
  const [focused, setFocused] = useState<boolean>(false);

  const borderColor: string = error
    ? COLORS.error
    : focused
      ? COLORS.borderFocus
      : COLORS.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, { borderColor }]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textMuted}
          selectionColor={COLORS.accent}
          onFocus={(): void => setFocused(true)}
          onBlur={(): void => setFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          {...inputProps}
        />
        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={rightIcon} size={21} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  // Auth-kit labels: small, sentence-case, sitting close above the field.
  label: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs + 2,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    // One step above the panel surface so fields read as wells, not blends.
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    height: 54,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  iconBtn: {
    paddingLeft: SPACING.sm,
    height: 54,
    justifyContent: "center",
  },
  error: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.error,
  },
});
