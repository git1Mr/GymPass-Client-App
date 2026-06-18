import * as Device from "expo-device";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { JSX, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuroraBackground from "@/components/ui/AuroraBackground";
import Eyebrow from "@/components/ui/Eyebrow";
import FormInput from "@/components/ui/FormInput";
import GlassCard from "@/components/ui/GlassCard";
import GradientText from "@/components/ui/GradientText";
import PrimaryButton from "@/components/ui/PrimaryButton";
import UnityLogo from "@/components/ui/UnityLogo";
import toast from "@/components/ui/Toast";
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  RADIUS,
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
          : "Impossible de joindre le serveur. Vérifiez votre connexion.",
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
      <AuroraBackground />
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
              <UnityLogo size={46} />
            </View>
          </SafeAreaView>

          <GlassCard style={styles.panel} radius={RADIUS.xl}>
            <View style={styles.cardTitleWrap}>
              <Eyebrow style={styles.eyebrow}>Accès membre</Eyebrow>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Bon </Text>
                <GradientText colors={[...GRADIENTS.text]} style={styles.cardTitle}>
                  retour
                </GradientText>
              </View>
              <Text style={styles.cardSubtitle}>Connectez-vous pour continuer</Text>
              <View style={styles.switchRow}>
                <Text style={styles.footerText}>Nouveau sur Unity Fitness ? </Text>
                <TouchableOpacity
                  onPress={(): void => router.push("/(auth)/register")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.footerLink}>Créer un compte</Text>
                </TouchableOpacity>
              </View>
            </View>

            <FormInput
              label="E-mail"
              placeholder="vous@exemple.com"
              keyboardType="email-address"
              autoComplete="email"
              value={form.email}
              onChangeText={setField("email")}
              error={errors.email}
            />

            <FormInput
              label="Mot de passe"
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
                  {rememberMe ? <Ionicons name="checkmark" size={14} color={COLORS.textOnPrimary} /> : null}
                </View>
                <Text style={styles.rememberLabel}>Se souvenir de moi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={(): void => router.push("/(auth)/forgot-password")}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotLink}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>

            <PrimaryButton
              title="Se connecter"
              onPress={handleLogin}
              loading={loading}
              style={styles.cta}
            />
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: SPACING.lg },

  heroSafe: { backgroundColor: COLORS.transparent },
  hero: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
  },

  // Glass auth panel: frosted card inset from the edges holding the title,
  // the switch link, and the form.
  panel: {
    marginHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  cardTitleWrap: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  eyebrow: { marginBottom: SPACING.sm },
  titleRow: { flexDirection: "row", alignItems: "baseline" },
  cardTitle: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.display,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
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
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  rememberLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  forgotLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryLight,
    fontFamily: FONTS.semibold,
  },

  cta: { marginTop: SPACING.xs },

  footerText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryLight,
    fontFamily: FONTS.semibold,
  },
});
