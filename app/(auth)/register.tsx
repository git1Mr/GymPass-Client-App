import * as Device from "expo-device";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { JSX, useState } from "react";
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
  SPACING,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { AuthError } from "@/services/authService";
import { registerSchema, validate } from "@/validation/authSchema";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function parseRegisterError(
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
    case "EMAIL_TAKEN":
      return { field: "email", message: err.message };
    default:
      return { message: err.message };
  }
}

export default function RegisterScreen(): JSX.Element {
  const { signUp } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPass, setShowPass] = useState<boolean>(false);
  const [showConf, setShowConf] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  function setField(field: keyof RegisterForm) {
    return (value: string): void => {
      setForm((f) => ({ ...f, [field]: value }));
      if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    };
  }

  async function handleRegister(): Promise<void> {
    const clientErrors = validate(registerSchema, form as unknown as Record<string, unknown>);
    if (clientErrors) {
      setErrors(clientErrors as FormErrors);
      return;
    }

    setLoading(true);
    try {
      const deviceId = Device.modelId ?? Device.osInternalBuildId ?? "unknown-device";
      await signUp({ ...form, deviceId });
      toast.success("Welcome to UnityFitness!");
    } catch (err: unknown) {
      const { field, message } = parseRegisterError(err);
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

              <TouchableOpacity
                onPress={(): void => router.back()}
                style={styles.backBtn}
                activeOpacity={0.7}
                hitSlop={10}
              >
                <Ionicons name="chevron-back" size={22} color={COLORS.white} />
              </TouchableOpacity>

              <View style={styles.logoWrap}>
                <UFLogo size={80} variant="light" />
              </View>
              <Text style={styles.heroTitle}>Create account</Text>
              <Text style={styles.heroSubtitle}>
                Join the Unity Fitness network
              </Text>
            </View>
          </SafeAreaView>

          <View style={styles.panel}>
            <FormInput
              label="Full Name"
              placeholder="Full Name"
              autoCapitalize="words"
              autoComplete="name"
              value={form.name}
              onChangeText={setField("name")}
              error={errors.name}
            />

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
              placeholder="Min. 8 characters"
              secureTextEntry={!showPass}
              autoComplete="new-password"
              value={form.password}
              onChangeText={setField("password")}
              error={errors.password}
              rightIcon={showPass ? "🙈" : "👁️"}
              onRightIconPress={(): void => setShowPass((v) => !v)}
            />

            <FormInput
              label="Confirm Password"
              placeholder="Repeat your password"
              secureTextEntry={!showConf}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChangeText={setField("confirmPassword")}
              error={errors.confirmPassword}
              rightIcon={showConf ? "🙈" : "👁️"}
              onRightIconPress={(): void => setShowConf((v) => !v)}
            />

            <Pressable
              onPress={handleRegister}
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
                  <Text style={styles.ctaLabel}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                </>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={(): void => router.push("/(auth)/login")}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Sign in</Text>
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
  backBtn: {
    alignSelf: "flex-start",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    zIndex: 2,
  },
  logoWrap: { marginTop: SPACING.xs, zIndex: 1 },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
    marginTop: SPACING.md,
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

  cta: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
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

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  footerText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  footerLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryDark,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
