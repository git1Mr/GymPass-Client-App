import * as Device from "expo-device";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { JSX, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FormInput from "@/components/ui/FormInput";
import DarkVeil from "@/components/ui/DarkVeil";
import UFLogo from "@/components/ui/UFLogo";
import toast from "@/components/ui/Toast";
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  RADIUS,
  SHADOWS,
  SPACING,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { AuthError, getRememberedEmail } from "@/services/authService";
import { loginSchema, validate } from "@/validation/authSchema";

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

function parseLoginError(
  err: unknown,
): { field?: keyof FormErrors; message: string } {
  if (!(err instanceof AuthError)) {
    return {
      message:
        err instanceof Error
          ? err.message
          : "Could not connect to the server. Check your network.",
    };
  }

  switch (err.authCode) {
    case "EMAIL_NOT_FOUND":
      return { field: "email", message: err.message };
    case "WRONG_PASSWORD":
      return { field: "password", message: err.message };
    default:
      return { message: err.message };
  }
}

export default function LoginScreen(): JSX.Element {
  const { signIn } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPass, setShowPass] = useState<boolean>(false);
  const [rememberMe, setRemember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect((): void => {
    (async (): Promise<void> => {
      const saved = await getRememberedEmail();
      if (saved) {
        setForm((f) => ({ ...f, email: saved }));
        setRemember(true);
      }
    })();
  }, []);

  function setField(field: keyof LoginForm) {
    return (value: string): void => {
      setForm((f) => ({ ...f, [field]: value }));
      if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    };
  }

  async function handleLogin(): Promise<void> {
    const clientErrors = validate(loginSchema, form as unknown as Record<string, unknown>);
    if (clientErrors) {
      setErrors(clientErrors as FormErrors);
      return;
    }

    setLoading(true);
    try {
      const deviceId = Device.modelId ?? Device.osInternalBuildId ?? "unknown-device";
      await signIn({ ...form, deviceId, rememberMe });
    } catch (err: unknown) {
      const { field, message } = parseLoginError(err);
      if (field) setErrors((e) => ({ ...e, [field]: message }));
      else toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <SafeAreaView edges={["top"]} style={styles.heroSafe}>
            <View style={styles.hero}>
              <View style={styles.pillarLayer} pointerEvents="none">
                <DarkVeil />
              </View>

              <View style={styles.logoWrap}>
                <UFLogo size={92} variant="light" />
              </View>
              <Text style={styles.heroTitle}>Welcome back !</Text>
              <Text style={styles.heroSubtitle}>Sign in to continue</Text>
            </View>
          </SafeAreaView>

          <View style={styles.panel}>
            <FormInput
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoComplete="email"
              value={form.email}
              onChangeText={setField("email")}
              error={errors.email}
            />

            <FormInput
              label="Password"
              placeholder="••••••••"
              secureTextEntry={!showPass}
              autoComplete="password"
              value={form.password}
              onChangeText={setField("password")}
              error={errors.password}
              rightIcon={showPass ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={(): void => setShowPass((v) => !v)}
            />

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={(): void => setRemember((v) => !v)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe ? <Ionicons name="checkmark" size={14} color={COLORS.white} /> : null}
                </View>
                <Text style={styles.rememberLabel}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={(): void => router.push("/(auth)/forgot-password")}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.cta,
                loading && styles.ctaDisabled,
                pressed && { opacity: 0.9 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.ctaLabel}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                </>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New to Unity Fitness? </Text>
              <TouchableOpacity
                onPress={(): void => router.push("/(auth)/register")}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0E0A1F" },
  kav: { flex: 1 },
  scroll: { flexGrow: 1 },

  heroSafe: { backgroundColor: "#0E0A1F" },
  hero: {
    backgroundColor: "#0E0A1F",
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxxl + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  pillarLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  logoWrap: { marginTop: SPACING.sm, zIndex: 1 },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
    marginTop: SPACING.lg,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.base,
    color: "rgba(255,255,255,0.78)",
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: SPACING.xs,
    textAlign: "center",
  },

  panel: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    marginTop: -SPACING.xl,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    flex: 1,
    minHeight: 420,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
    marginTop: -SPACING.xs,
  },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  rememberLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  forgotLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryDark,
    fontWeight: FONT_WEIGHTS.bold,
  },

  cta: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaDisabled: { opacity: 0.7 },
  ctaLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.3,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.8,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  footerLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryDark,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
