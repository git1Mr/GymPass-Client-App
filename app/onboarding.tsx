// app/onboarding.tsx
// 3-slide intro carousel in the landing "SaaS Futuristic" aesthetic: aurora
// canvas, brand illustration framed in a violet-glow ring, eyebrow + gradient
// title, violet pager dashes, full-width gradient Next/Get Started pill.
// Navigate here by calling router.replace("/onboarding") on first launch.

import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    Image,
    ImageSourcePropType,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuroraBackground from "@/components/ui/AuroraBackground";
import Eyebrow from "@/components/ui/Eyebrow";
import GradientFill from "@/components/ui/GradientFill";
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    GRADIENTS,
    RADIUS,
    SPACING,
} from "@/constants/theme";

const { width: W } = Dimensions.get("window");

interface Slide {
  image: ImageSourcePropType;
  eyebrow: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    image: require("@/assets/images/onboarding-2.png"),
    eyebrow: "Un seul réseau",
    title: "Entraînez-vous partout",
    body: "Accédez à plus de 50 salles partenaires au Maroc avec un seul pass flexible.",
  },
  {
    image: require("@/assets/images/onboarding-3.png"),
    eyebrow: "Sans engagement",
    title: "Payez à la séance",
    body: "Achetez des crédits une fois et utilisez-les chez tous les partenaires. Aucun frais mensuel.",
  },
  {
    image: require("@/assets/images/onboarding-1.png"),
    eyebrow: "Accès instantané",
    title: "Scannez & entrez",
    body: "Présentez votre QR code dans n'importe quelle salle partenaire. Sans carte, sans attente.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [current, setCurrent] = useState(0);
  const isLast = current === SLIDES.length - 1;

  function advance() {
    if (isLast) {
      router.replace("/(auth)/login");
    } else {
      const next = current + 1;
      scrollRef.current?.scrollTo({ x: W * next, animated: true });
      setCurrent(next);
    }
  }

  function onScroll(e: { nativeEvent: { contentOffset: { x: number } } }) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    if (idx !== current) setCurrent(idx);
  }

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.safe}>
        {!isLast && (
          <Pressable
            style={styles.skipBtn}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.skipText}>Passer</Text>
          </Pressable>
        )}

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          style={styles.pager}
        >
          {SLIDES.map((slide, i) => (
            <View key={i} style={styles.slide}>
              <View style={styles.heroRing}>
                <View style={styles.heroDisc}>
                  <Image
                    source={slide.image}
                    style={styles.heroImg}
                    resizeMode="cover"
                  />
                </View>
              </View>

              <View style={styles.dots}>
                {SLIDES.map((_, d) => (
                  <View key={d} style={[styles.dot, d === i && styles.dotActive]} />
                ))}
              </View>

              <Eyebrow style={styles.eyebrow}>{slide.eyebrow}</Eyebrow>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideBody}>{slide.body}</Text>
            </View>
          ))}
        </ScrollView>

        <Pressable style={styles.nextBtn} onPress={advance}>
          <GradientFill colors={GRADIENTS.primary} />
          <Text style={styles.nextText}>{isLast ? "Commencer" : "Suivant"}</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },

  skipBtn: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.lg,
    zIndex: 10,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
  },

  pager: { flex: 1 },
  slide: {
    width: W,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  // Violet-glow ring around a translucent disc holding the illustration.
  heroRing: {
    width: 268,
    height: 268,
    borderRadius: 134,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    backgroundColor: COLORS.glass,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 10,
  },
  heroDisc: {
    flex: 1,
    borderRadius: 124,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceSolid,
  },
  heroImg: { width: "100%", height: "100%" },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: SPACING.xl + SPACING.sm,
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.borderStrong,
  },
  dotActive: { width: 22, backgroundColor: COLORS.primaryLight, borderRadius: 3 },

  eyebrow: { marginBottom: SPACING.sm },
  slideTitle: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.display,
    color: COLORS.text,
    textAlign: "center",
    letterSpacing: -0.6,
    marginBottom: SPACING.sm,
  },
  slideBody: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },

  nextBtn: {
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.full,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 10,
  },
  nextText: {
    color: COLORS.textOnPrimary,
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZES.base,
  },
});
