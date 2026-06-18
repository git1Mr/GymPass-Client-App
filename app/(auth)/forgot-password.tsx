import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import toast from "@/components/ui/Toast";
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  RADIUS,
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
      setErrors({ email: "Saisissez un e-mail valide." });
      return;
    }
    setBusy(true);
    try {
      const res = await requestPasswordReset(email.trim().toLowerCase());
      // Demo: backend returns the raw token inline (no email infra). Auto-fill it.
      if (res.resetToken) {
        setToken(res.resetToken);
        toast.success("Pré-rempli ci-dessous — définissez votre nouveau mot de passe.", "Code émis");
      } else {
        toast.success("Nous avons envoyé un code à votre e-mail.", "Vérifiez votre boîte mail");
      }
      setStep("reset");
    } catch (err: any) {
      toast.error(err?.message ?? "Réessayez dans un instant.", "Échec de l'envoi du code");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(): Promise<void> {
    const nextErrors: typeof errors = {};
    if (!token.trim() || token.trim().length < 32) nextErrors.token = "Le code semble invalide.";
    if (!newPass || newPass.length < 8) nextErrors.newPass = "Le mot de passe doit comporter au moins 8 caractères.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setBusy(true);
    try {
      await resetPassword(token.trim(), newPass);
      toast.success("Connectez-vous avec votre nouveau mot de passe.", "Mot de passe mis à jour");
      router.replace("/(auth)/login");
    } catch (err: any) {
      toast.error(err?.message ?? "Le code a peut-être expiré.", "Échec de la réinitialisation");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <AuroraBackground />
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
          <GlassCard style={styles.panel} radius={RADIUS.xl}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={(): void => router.back()}
              activeOpacity={0.7}
              hitSlop={10}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            </TouchableOpacity>

            <View style={styles.cardTitleWrap}>
              <View style={styles.heroIcon}>
                <Ionicons name="key-outline" size={28} color={COLORS.primaryLight} />
              </View>
              <Eyebrow style={styles.eyebrow}>Récupération du compte</Eyebrow>
              <GradientText
                colors={[...GRADIENTS.text]}
                style={styles.title}
              >
                {step === "request" ? "Mot de passe oublié ?" : "Nouveau mot de passe"}
              </GradientText>
              <Text style={styles.subtitle}>
                {step === "request"
                  ? "Saisissez l'e-mail associé à votre compte Unity Fitness et nous vous enverrons un code de réinitialisation."
                  : "Collez le code reçu et choisissez un nouveau mot de passe (min. 8 caractères)."}
              </Text>
            </View>

            {step === "request" ? (
              <>
                <FormInput
                  label="E-mail"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  error={errors.email}
                  containerStyle={styles.input}
                />

                <PrimaryButton
                  title="Envoyer le code"
                  onPress={handleRequest}
                  loading={busy}
                  style={styles.cta}
                />
              </>
            ) : (
              <>
                <FormInput
                  label="Code de réinitialisation"
                  placeholder="Code hexadécimal de 64 caractères"
                  value={token}
                  onChangeText={setToken}
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.token}
                  containerStyle={styles.input}
                />

                <FormInput
                  label="Nouveau mot de passe"
                  placeholder="Au moins 8 caractères"
                  value={newPass}
                  onChangeText={setNewPass}
                  secureTextEntry={!showPass}
                  rightIcon={showPass ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={(): void => setShowPass(!showPass)}
                  error={errors.newPass}
                  containerStyle={styles.input}
                />

                <PrimaryButton
                  title="Réinitialiser le mot de passe"
                  onPress={handleReset}
                  loading={busy}
                  style={styles.cta}
                />

                <TouchableOpacity
                  onPress={(): void => setStep("request")}
                  style={styles.linkBtn}
                >
                  <Text style={styles.linkText}>Envoyer un nouveau code</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={(): void => router.replace("/(auth)/login")}
              style={[styles.linkBtn, { marginTop: SPACING.lg }]}
            >
              <Text style={styles.linkText}>← Retour à la connexion</Text>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1, backgroundColor: "transparent" },
  scroll: { padding: SPACING.md, paddingTop: SPACING.xxl },

  // Same glass card as login/register so the auth flow reads as one set.
  panel: {
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
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  eyebrow: { marginBottom: SPACING.sm },
  title: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.display,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginTop: SPACING.sm,
    textAlign: "center",
  },

  input: { marginBottom: SPACING.md },

  cta: { marginTop: SPACING.xs },

  linkBtn: {
    alignSelf: "center",
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
  },
  linkText: {
    color: COLORS.primaryLight,
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZES.sm,
  },
});
