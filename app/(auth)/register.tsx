import * as Device from "expo-device";
import { useRouter } from "expo-router";
import React, { JSX, useState } from "react";
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
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { registerSchema, validate } from "@/validation/authSchema";

const SCREEN_HEIGHT = Dimensions.get("window").height;

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

function parseBackendError(err: unknown): { field?: keyof FormErrors; message: string } {
  const axiosErr = err as {
    response?: { data?: unknown; status?: number };
    message?: string;
  };
  const status = axiosErr.response?.status;
  const raw = axiosErr.response?.data;
  const rawStr = typeof raw === "string" ? raw.toLowerCase() : "";

  if (status === 400) {
    if (rawStr.includes("email already") || rawStr.includes("already registered"))
      return { field: "email", message: "An account with this email already exists." };
    if (rawStr.includes("device"))
      return { message: "This device is already linked to another account." };
    if (typeof raw === "string") return { message: raw };
  }

  return { message: axiosErr.message ?? "Could not connect to the server. Check your network." };
}

export default function RegisterScreen(): JSX.Element {
  const { signUp } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);

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
      toast.success("Welcome to GymPass!");
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
      <View style={{ height: insets.top, backgroundColor: COLORS.accent }} />

      <View style={styles.topSection}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={(): void => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.logoMark}>
          <Text style={styles.logoLetter}>G</Text>
        </View>
        <Text style={styles.appName}>GymPass</Text>
        <Text style={styles.tagline}>Create your account</Text>
      </View>

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
          <View style={styles.form}>
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

            <PrimaryButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              style={styles.btn}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={(): void => router.push("/(auth)/login")}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Sign in</Text>
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
    backgroundColor: COLORS.accent,
  },
  topSection: {
    height: SCREEN_HEIGHT * 0.28,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
  },
  backBtn: {
    position: "absolute",
    top: SPACING.sm,
    left: SPACING.lg,
  },
  backArrow: {
    fontSize: FONT_SIZES.xl,
    color: "rgba(255,255,255,0.85)",
  },
  logoMark: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  logoLetter: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.accent,
  },
  appName: {
    color: COLORS.white,
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
    backgroundColor: COLORS.surface,
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
  btn: { marginTop: SPACING.sm },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  footerText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  footerLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});