import AuroraBackground from "@/components/ui/AuroraBackground";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import GradientFill from "@/components/ui/GradientFill";
import toast from "@/components/ui/Toast";
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    GRADIENTS,
    RADIUS,
    SPACING,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Pricing mirrors the landing PricingSection (without the Partner plan):
// Explorer = pay-per-session credit packs, Unity Unlimited = monthly pass.
const CREDIT_PACKS = [
  { id: "pack5", credits: 5, price: "60 DH" },
  { id: "pack15", credits: 15, price: "150 DH" },
  { id: "pack30", credits: 30, price: "270 DH" },
];

const EXPLORER_FEATURES = [
  "Accès à l'ensemble du réseau partenaire",
  "Génération de QR code instantanée",
  "Aucun engagement mensuel",
  "Historique et journal d'activité",
];

const UNLIMITED_FEATURES = [
  "Accès illimité chaque jour",
  "Accès complet au réseau partenaire",
  "Génération de QR prioritaire",
  "Statistiques d'activité avancées",
  "Itinérance multi-villes incluse",
  "Accès anticipé aux nouveaux partenaires",
];

const EXPLORER_ACCENT = COLORS.success;
const UNLIMITED_ACCENT = COLORS.primaryLight;

function Feature({ text, accent }: { text: string; accent: string }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name="checkmark" size={14} color={accent} style={styles.check} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

export default function PlansScreen() {
  const router = useRouter();

  const buyPack = (id: string) =>
    router.push({ pathname: "/checkout", params: { planId: id } });

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.head}>
            <Eyebrow>Tarifs</Eyebrow>
            <Text style={styles.title}>Une tarification simple et transparente.</Text>
            <Text style={styles.subtitle}>
              Que vous veniez une fois par semaine ou tous les jours, il y a une
              formule faite pour vous.
            </Text>
          </View>

          {/* ── Explorer (credit packs) ── */}
          <GlassCard style={styles.card}>
            <View
              style={[
                styles.iconWell,
                { backgroundColor: EXPLORER_ACCENT + "22", borderColor: EXPLORER_ACCENT + "55" },
              ]}
            >
              <Ionicons name="flash-outline" size={22} color={EXPLORER_ACCENT} />
            </View>
            <Text style={styles.name}>Explorer</Text>
            <Text style={styles.tagline}>Payez à la séance</Text>

            <Text style={styles.packsLabel}>Packs de crédits</Text>
            <View style={styles.packsRow}>
              {CREDIT_PACKS.map((pack) => (
                <TouchableOpacity
                  key={pack.id}
                  style={styles.pack}
                  activeOpacity={0.85}
                  onPress={() => buyPack(pack.id)}
                >
                  <Text style={styles.packCredits}>{pack.credits}</Text>
                  <Text style={styles.packUnit}>crédits</Text>
                  <Text style={[styles.packPrice, { color: EXPLORER_ACCENT }]}>
                    {pack.price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.features}>
              {EXPLORER_FEATURES.map((f) => (
                <Feature key={f} text={f} accent={EXPLORER_ACCENT} />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.cta, styles.ctaIdle]}
              activeOpacity={0.9}
              onPress={() => router.push("/top-up")}
            >
              <Text style={[styles.ctaText, styles.ctaTextIdle]}>
                Acheter des crédits
              </Text>
            </TouchableOpacity>
          </GlassCard>

          {/* ── Unity Unlimited (monthly) ── */}
          <GlassCard highlighted style={styles.card}>
            <View style={styles.badge}>
              <GradientFill colors={GRADIENTS.primary} />
              <Text style={styles.badgeText}>LE PLUS POPULAIRE</Text>
            </View>

            <View
              style={[
                styles.iconWell,
                { backgroundColor: UNLIMITED_ACCENT + "22", borderColor: UNLIMITED_ACCENT + "55" },
              ]}
            >
              <Ionicons name="infinite-outline" size={22} color={UNLIMITED_ACCENT} />
            </View>
            <Text style={styles.name}>Unity Unlimited</Text>
            <Text style={styles.tagline}>Un seul prix, toutes les salles</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>199</Text>
              <Text style={styles.priceUnit}> DH / mois</Text>
            </View>

            <View style={styles.features}>
              {UNLIMITED_FEATURES.map((f) => (
                <Feature key={f} text={f} accent={UNLIMITED_ACCENT} />
              ))}
            </View>

            <TouchableOpacity
              style={styles.cta}
              activeOpacity={0.9}
              onPress={() =>
                toast.info(
                  "Les abonnements mensuels arrivent bientôt.",
                  "Bientôt disponible",
                )
              }
            >
              <GradientFill colors={GRADIENTS.primary} />
              <Text style={styles.ctaText}>Démarrer l&apos;essai gratuit</Text>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },

  head: { marginBottom: SPACING.xl },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.display,
    color: COLORS.text,
    letterSpacing: -0.6,
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginTop: SPACING.sm,
  },

  card: { padding: SPACING.lg, marginBottom: SPACING.lg },

  badge: {
    position: "absolute",
    top: 0,
    right: SPACING.lg,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
    overflow: "hidden",
  },
  badgeText: {
    fontSize: 10,
    fontFamily: FONTS.mono,
    color: COLORS.textOnPrimary,
    letterSpacing: 1,
  },

  iconWell: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Explorer credit packs
  packsLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  packsRow: { flexDirection: "row", gap: SPACING.sm },
  pack: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceSolid,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  packCredits: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  packUnit: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  packPrice: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.mono,
    marginTop: SPACING.xs,
  },

  // Unlimited price
  priceRow: { flexDirection: "row", alignItems: "flex-end", marginTop: SPACING.lg },
  price: {
    fontSize: FONT_SIZES.hero,
    fontFamily: FONTS.display,
    color: COLORS.text,
    letterSpacing: -1.5,
    lineHeight: FONT_SIZES.hero,
  },
  priceUnit: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    paddingBottom: 4,
  },

  features: { gap: SPACING.sm, marginTop: SPACING.lg, marginBottom: SPACING.lg },
  featureRow: { flexDirection: "row", alignItems: "flex-start" },
  check: { marginTop: 2, marginRight: SPACING.sm },
  featureText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  cta: {
    height: 50,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ctaIdle: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ctaText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semibold,
    color: COLORS.textOnPrimary,
  },
  ctaTextIdle: { color: COLORS.text },
});
