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
    FONT_SIZES,
    FONT_WEIGHTS,
    RADIUS,
    SPACING,
} from "@/constants/theme";

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: string;
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
          >
            <Text style={styles.iconText}>{rightIcon}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
  },
  iconBtn: {
    paddingLeft: SPACING.sm,
    height: 52,
    justifyContent: "center",
  },
  iconText: { fontSize: 18 },
  error: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
});
