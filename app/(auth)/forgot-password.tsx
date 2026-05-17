import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { JSX, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DarkVeil from "@/components/ui/DarkVeil";
import FormInput from "@/components/ui/FormInput";
import toast from "@/components/ui/Toast";
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  RADIUS,
  SHADOWS,
  SPACING,
} from "@/constants/theme";
import { requestPasswordReset, resetPassword } from "@/services/authService";

type Step = "request" | "reset";

export default function ForgotPasswordScreen(): JSX.Element {
  const router = useRouter();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; token?: string; newPass?: string }>({});

  async function handleRequest(): Promise<void> {
    setErrors({});
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrors({ email: "Enter a valid email." });
      return;
    }
    setBusy(true);
    try {
      const res = await requestPasswordReset(email.trim().toLowerCase());
      // Demo: backend returns the raw token inline (no email infra). Auto-fill it.
      if (res.resetToken) {
        setToken(res.resetToken);
        toast.success("Auto-filled below — set your new password.", "Reset code issued");
      } else {
        toast.success("We sent a reset code to your email.", "Check your inbox");
      }
      setStep("reset");
    } catch (err: any) {
      toast.error(err?.message ?? "Try again in a moment.", "Couldn't issue reset code");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(): Promise<void> {
    const nextErrors: typeof errors = {};
    if (!token.trim() || token.trim().length < 32) nextErrors.token = "Reset code looks invalid.";
    if (!newPass || newPass.length < 8) nextErrors.newPass = "Password must be at least 8 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setBusy(true);
    try {
      await resetPassword(token.trim(), newPass);
      toast.success("Sign in with your new password.", "Password updated");
      router.replace("/(auth)/login");
    } catch (err: any) {
      toast.error(err?.message ?? "Token may be expired.", "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <DarkVeil />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={(): void => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.heroIcon}>
            <Ionicons name="key-outline" size={32} color={COLORS.accent} />
          </View>

          <Text style={styles.title}>
            {step === "request" ? "Forgot your password?" : "Set a new password"}
          </Text>
          <Text style={styles.subtitle}>
            {step === "request"
              ? "Enter the email tied to your UnityFitness account and we'll issue a reset code."
              : "Paste the reset code we issued and choose a new password (min. 8 characters)."}
          </Text>

          {step === "request" ? (
            <>
              <FormInput
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                error={errors.email}
                containerStyle={styles.input}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, busy && styles.primaryBtnDisabled]}
                onPress={handleRequest}
                disabled={busy}
                activeOpacity={0.85}
              >
                {busy ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>Send reset code</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <FormInput
                label="Reset code"
                placeholder="64-character hex code"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.token}
                containerStyle={styles.input}
              />

              <FormInput
                label="New password"
                placeholder="At least 8 characters"
                value={newPass}
                onChangeText={setNewPass}
                secureTextEntry={!showPass}
                rightIcon={showPass ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={(): void => setShowPass(!showPass)}
                error={errors.newPass}
                containerStyle={styles.input}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, busy && styles.primaryBtnDisabled]}
                onPress={handleReset}
                disabled={busy}
                activeOpacity={0.85}
              >
                {busy ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>Reset password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={(): void => setStep("request")}
                style={styles.linkBtn}
              >
                <Text style={styles.linkText}>Send a new code</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={(): void => router.replace("/(auth)/login")}
            style={[styles.linkBtn, { marginTop: SPACING.xl }]}
          >
            <Text style={styles.linkText}>← Back to sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0E0A1F" },
  safe: { flex: 1, backgroundColor: "transparent" },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.md },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
  },

  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },

  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },

  input: { marginBottom: SPACING.md },

  primaryBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.sm,
    ...SHADOWS.card,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.base,
  },

  linkBtn: {
    alignSelf: "center",
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
  },
  linkText: {
    color: COLORS.accent,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: FONT_SIZES.sm,
  },
});
