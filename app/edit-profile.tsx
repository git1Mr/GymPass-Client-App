// app/edit-profile.tsx
// Edit profile screen in the kit's layout: circular header buttons, large
// avatar with an edit badge, name, divider, labeled fields, gradient Save.
// The backend exposes no profile-update endpoint yet, so Save is a stub.

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AuroraBackground from "@/components/ui/AuroraBackground";
import CircleIconButton from "@/components/ui/CircleIconButton";
import FormInput from "@/components/ui/FormInput";
import GradientFill from "@/components/ui/GradientFill";
import PrimaryButton from "@/components/ui/PrimaryButton";
import toast from "@/components/ui/Toast";
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    GRADIENTS,
    SPACING,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [name, setName] = useState<string>(user?.name ?? "");

  function handleSave(): void {
    // No PUT /users/me on the backend yet — keep the UI honest.
    toast.info("La modification du profil sera bientôt disponible.", "Bientôt disponible");
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AuroraBackground />
      {/* Header */}
      <View style={styles.header}>
        <CircleIconButton icon="chevron-back" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <CircleIconButton icon="ellipsis-vertical" iconSize={18} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar + edit badge + name */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatarShell}>
              <View style={styles.avatarCircle}>
                <GradientFill colors={GRADIENTS.primary} />
                <Ionicons name="person" size={52} color={COLORS.textOnPrimary} />
              </View>
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={14} color={COLORS.white} />
              </View>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {user?.name ?? "Membre"}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Fields */}
          <View style={styles.form}>
            <FormInput
              label="Nom complet"
              placeholder="Nom complet"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
            <FormInput
              label="E-mail"
              placeholder="vous@exemple.com"
              value={user?.email ?? ""}
              editable={false}
              rightIcon="mail-outline"
            />
          </View>
        </ScrollView>

        {/* Save */}
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, SPACING.md) },
          ]}
        >
          <PrimaryButton title="Enregistrer" onPress={handleSave} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },

  scroll: { paddingBottom: SPACING.xl },

  avatarWrap: {
    alignItems: "center",
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  avatarShell: { position: "relative" },
  avatarCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.magenta,
    borderWidth: 3,
    borderColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.display,
    color: COLORS.text,
    letterSpacing: -0.4,
    marginTop: SPACING.md,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.lg,
  },

  form: {
    paddingHorizontal: SPACING.lg,
  },

  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
});
