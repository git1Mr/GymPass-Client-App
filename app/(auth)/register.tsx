import * as Device from "expo-device";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { JSX, useState } from "react";
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
          : "Impossible de joindre le serveur. Vérifiez votre connexion.",
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
      toast.success("Bienvenue sur Unity Fitness !");
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
            {/* Back arrow at the card's top-left, centered title below. */}
            <TouchableOpacity
              onPress={(): void => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
              hitSlop={10}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            </TouchableOpacity>

            <View style={styles.cardTitleWrap}>
              <Eyebrow style={styles.eyebrow}>Rejoindre le réseau</Eyebrow>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Créer un </Text>
                <GradientText colors={[...GRADIENTS.text]} style={styles.cardTitle}>
                  compte
                </GradientText>
              </View>
              <Text style={styles.cardSubtitle}>
                Un seul pass pour toutes les salles partenaires
              </Text>
              <View style={styles.switchRow}>
                <Text style={styles.footerText}>Vous avez déjà un compte ? </Text>
                <TouchableOpacity
                  onPress={(): void => router.push("/(auth)/login")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.footerLink}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </View>

            <FormInput
              label="Nom complet"
              placeholder="Nom complet"
              autoCapitalize="words"
              autoComplete="name"
              value={form.name}
              onChangeText={setField("name")}
              error={errors.name}
            />

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
              placeholder="Min. 8 caractères"
              secureTextEntry={!showPass}
              autoComplete="new-password"
              value={form.password}
              onChangeText={setField("password")}
              error={errors.password}
              rightIcon={showPass ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={(): void => setShowPass((v) => !v)}
            />

            <FormInput
              label="Confirmer le mot de passe"
              placeholder="Répétez votre mot de passe"
              secureTextEntry={!showConf}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChangeText={setField("confirmPassword")}
              error={errors.confirmPassword}
              rightIcon={showConf ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={(): void => setShowConf((v) => !v)}
            />

            <PrimaryButton
              title="Créer un compte"
              onPress={handleRegister}
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
  },

  panel: {
    marginHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  backBtn: {
    alignSelf: "flex-start",
    marginBottom: SPACING.sm,
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

  cta: { marginTop: SPACING.sm },

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
