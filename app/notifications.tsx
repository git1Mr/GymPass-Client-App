// app/notifications.tsx
// Notifications screen in the kit's layout: circular header buttons, day
// group labels, tall rows (icon circle · bold title · time · gray body)
// separated by hairlines. Items are placeholders — no notifications backend.

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AuroraBackground from "@/components/ui/AuroraBackground";
import CircleIconButton from "@/components/ui/CircleIconButton";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import GradientFill from "@/components/ui/GradientFill";
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    GRADIENTS,
    SPACING,
} from "@/constants/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface Notice {
  id: string;
  icon: IoniconsName;
  title: string;
  body: string;
  time: string;
}

const TODAY: Notice[] = [
  {
    id: "1",
    icon: "qr-code",
    title: "Unity Fitness",
    body: "Entrée confirmée à FitClub Casablanca. Bonne séance ! 💪",
    time: "07:32",
  },
  {
    id: "2",
    icon: "wallet",
    title: "Unity Fitness",
    body: "25 crédits ont été ajoutés à votre solde.",
    time: "09:15",
  },
];

const YESTERDAY: Notice[] = [
  {
    id: "3",
    icon: "flash",
    title: "EliteGym Rabat",
    body: "Le nouveau planning des cours est disponible pour la semaine prochaine.",
    time: "18:40",
  },
  {
    id: "4",
    icon: "trophy",
    title: "Unity Fitness",
    body: "Résumé de la semaine : 3 entrées dans 2 clubs. Continuez comme ça !",
    time: "10:00",
  },
];

function NoticeRow({ notice, last }: { notice: Notice; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowTop}>
        <View style={styles.iconCircle}>
          <GradientFill colors={GRADIENTS.primary} />
          <Ionicons
            name={notice.icon}
            size={22}
            color={COLORS.textOnPrimary}
          />
        </View>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {notice.title}
        </Text>
        <Text style={styles.rowTime}>{notice.time}</Text>
      </View>
      <Text style={styles.rowBody}>{notice.body}</Text>
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AuroraBackground />
      <View style={styles.header}>
        <CircleIconButton icon="chevron-back" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Notifications</Text>
        <CircleIconButton icon="ellipsis-vertical" iconSize={18} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Eyebrow style={styles.groupLabel}>Aujourd&apos;hui</Eyebrow>
        <GlassCard style={styles.group}>
          {TODAY.map((n, i) => (
            <NoticeRow key={n.id} notice={n} last={i === TODAY.length - 1} />
          ))}
        </GlassCard>

        <Eyebrow style={styles.groupLabel}>Hier</Eyebrow>
        <GlassCard style={styles.group}>
          {YESTERDAY.map((n, i) => (
            <NoticeRow key={n.id} notice={n} last={i === YESTERDAY.length - 1} />
          ))}
        </GlassCard>
      </ScrollView>
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

  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },

  groupLabel: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  group: { paddingHorizontal: SPACING.md },

  row: {
    paddingVertical: SPACING.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  rowTitle: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  rowTime: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  rowBody: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginTop: SPACING.sm,
  },
});
