// app/(auth)/login.tsx
//
// On successful signIn, this screen does NOT manually navigate.
// AuthContext.setToken(token) fires → AuthGate's useEffect runs →
// router.replace('/(tabs)') is called — the auth stack is wiped from history.

import * as Device from "expo-device";
import { useRouter } from "expo-router";
import React, { JSX, useEffect, useState } from "react";
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FormInput from "@/components/ui/FormInput";
import PrimaryButton from "@/components/ui/PrimaryButton";
import toast from "@/components/ui/Toast";
import {
    COLORS,
    FONT_SIZES,
    FONT_WEIGHTS,
    RADIUS,
    SPACING,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getRememberedEmail } from "@/services/authService";
import { loginSchema, validate } from "@/validation/authSchema";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const BRAND = "#3C0008";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseBackendError(err: unknown): {
  field?: keyof FormErrors;
  message: string;
} {
  const axiosErr = err as {
    response?: { data?: unknown; status?: number };
    message?: string;
  };
  const status = axiosErr.response?.status;
  const raw = axiosErr.response?.data;
  const rawStr = typeof raw === "string" ? raw.toLowerCase() : "";

  if (status === 400) {
    if (rawStr.includes("email"))
      return { field: "email", message: "No account found with this email." };
    if (rawStr.includes("password") || rawStr.includes("invalid"))
      return {
        field: "password",
        message: "Incorrect password. Please try again.",
      };
    return { message: typeof raw === "string" ? raw : "Invalid credentials." };
  }

  if (status === 403) {
    if (rawStr.includes("device"))
      return { message: "This account is linked to a different device." };
    if (rawStr.includes("suspended"))
      return { message: "Your account has been suspended. Contact support." };
  }

  const fallback =
    axiosErr.message ?? "Could not connect to the server. Check your network.";
  return { message: fallback };
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function LoginScreen(): JSX.Element {
  const { signIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPass, setShowPass] = useState<boolean>(false);
  const [rememberMe, setRemember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect((): void => {
    (async (): Promise<void> => {
      const saved: string | null = await getRememberedEmail();
      if (saved) {
        setForm((f) => ({ ...f, email: saved, password: "" }));
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
    const clientErrors = validate(
      loginSchema,
      form as unknown as Record<string, unknown>,
    );
    if (clientErrors) {
      setErrors(clientErrors as FormErrors);
      return;
    }

    setLoading(true);
    try {
      const deviceId: string =
        Device.modelId ?? Device.osInternalBuildId ?? "unknown-device";
      await signIn({ ...form, deviceId, rememberMe });
    } catch (err: unknown) {
      const { field, message } = parseBackendError(err);
      if (field) {
        setErrors((e) => ({ ...e, [field]: message }));
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Status bar safe area */}
      <View style={{ height: insets.top, backgroundColor: BRAND }} />

      {/* ── Top Section (30%) ── */}
      <View style={styles.topSection}>
        <View style={styles.logoMark}>
          <Text style={styles.logoLetter}>G</Text>
        </View>
        <Text style={styles.appName}>GymPass</Text>
        <Text style={styles.tagline}>Welcome back</Text>
        <Text style={styles.tagline}>Log In to go forward</Text>
      </View>

      {/* ── Bottom Section (70%) ── */}
      <KeyboardAvoidingView
        style={styles.bottomSection}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Math.max(SPACING.xl, insets.bottom + SPACING.md) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Form ── */}
          <View style={styles.form}>
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
              rightIcon={showPass ? "🙈" : "👁️"}
              onRightIconPress={(): void => setShowPass((v) => !v)}
            />

            {/* Remember me + Forgot password */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={(): void => setRemember((v) => !v)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.checkbox, rememberMe && styles.checkboxActive]}
                >
                  {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
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

            <PrimaryButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.btn}
            />
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={(): void => router.push("/(auth)/register")}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Create one</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND,
  },
  topSection: {
    height: SCREEN_HEIGHT * 0.28,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
  },
  logoMark: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  logoLetter: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.black,
    color: BRAND,
  },
  appName: {
    color: "#FFFFFF",
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.black,
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  tagline: {
    color: "rgba(255,255,255,0.75)",
    fontSize: FONT_SIZES.base,
  },

  bottomSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    overflow: "hidden",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  form: { flex: 1 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
    marginTop: -SPACING.xs,
  },
  rememberRow: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.xs,
  },
  checkboxActive: {
    backgroundColor: BRAND,
    borderColor: BRAND,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.bold,
  },
  rememberLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  forgotLink: {
    fontSize: FONT_SIZES.sm,
    color: BRAND,
    fontWeight: FONT_WEIGHTS.medium,
  },
  btn: { marginTop: SPACING.xs },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  footerText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  footerLink: {
    fontSize: FONT_SIZES.sm,
    color: BRAND,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
