// app/credits.tsx
//
// CreditsScreen — surfaces the user's UnityFitnessCredits balance and a
// chronological feed of ledger activity (top-ups + gym deductions).
// "Top up" CTA routes to /top-up which hosts the Stripe Payment Sheet flow.

import AuroraBackground from "@/components/ui/AuroraBackground";
import GradientSurface from "@/components/ui/GradientSurface";
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    RADIUS,
    SHADOWS,
    SPACING,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import {
  CreditTransaction,
  fetchMyTransactions,
} from "@/services/paymentsService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function TxRow({ tx }: { tx: CreditTransaction }) {
  const isCredit = tx.type === "purchase";
  return (
    <View style={txStyles.row}>
      <View
        style={[
          txStyles.iconWrap,
          { backgroundColor: isCredit ? "rgba(30,138,76,0.12)" : COLORS.accentMuted },
        ]}
      >
        <Ionicons
          name={isCredit ? "arrow-down-circle" : "arrow-up-circle"}
          size={22}
          color={isCredit ? COLORS.success : COLORS.accent}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={txStyles.title}>
          {isCredit
            ? tx.packLabel || `Recharge · ${tx.pointsAmount} crédits`
            : `Séance · ${tx.pointsAmount} crédits`}
        </Text>
        <Text style={txStyles.meta}>
          {formatDate(tx.createdAt)}
          {tx.provider ? ` · ${tx.provider}` : ""}
        </Text>
      </View>
      <Text
        style={[
          txStyles.amount,
          { color: isCredit ? COLORS.success : COLORS.accent },
        ]}
      >
        {isCredit ? "+" : "−"}
        {tx.pointsAmount}
      </Text>
    </View>
  );
}

const txStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  meta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  amount: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.black,
  },
});

export default function CreditsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [txs, setTxs] = useState<CreditTransaction[]>([]);
  const [balance, setBalance] = useState<number>(user?.pointsBalance ?? 0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const load = useCallback(async () => {
    try {
      const [meRes, list] = await Promise.all([
        api.get("/users/me").catch(() => null),
        fetchMyTransactions().catch(() => []),
      ]);
      if (meRes?.data?.pointsBalance != null) {
        setBalance(meRes.data.pointsBalance as number);
      }
      setTxs(list);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <AuroraBackground />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes crédits</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
      >
        {/* Balance hero */}
        <GradientSurface
          radius={RADIUS.xl}
          style={styles.hero}
          dimmer={0.08}
        >
          <View style={styles.heroBody}>
            <Text style={styles.heroLabel}>CRÉDITS UNITY FITNESS</Text>
            <Text style={styles.heroValue}>
              {balance}
              <Text style={styles.heroUnit}> crédits</Text>
            </Text>
            <Text style={styles.heroSub}>
              Utilisez vos crédits dans tous les clubs du réseau.
            </Text>

            <TouchableOpacity
              style={styles.topUpBtn}
              onPress={() => router.push("/top-up")}
              activeOpacity={0.9}
            >
              <Ionicons name="add-circle" size={18} color={COLORS.accent} />
              <Text style={styles.topUpText}>Recharger des crédits</Text>
            </TouchableOpacity>
          </View>
        </GradientSurface>

        {/* Activity */}
        <Text style={styles.sectionLabel}>ACTIVITÉ RÉCENTE</Text>
        <View style={styles.list}>
          {loading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={COLORS.accent} />
            </View>
          ) : txs.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="wallet-outline" size={36} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Aucune transaction</Text>
              <Text style={styles.emptyBody}>
                Rechargez vos crédits pour commencer.
              </Text>
            </View>
          ) : (
            txs.map((tx) => <TxRow key={tx._id} tx={tx} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // CaFit header: bare background, outlined circle back button, centered title.
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },

  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },

  hero: { marginBottom: SPACING.lg, ...SHADOWS.pop },
  heroBody: { padding: SPACING.xl },
  heroLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 1.6,
    marginBottom: SPACING.sm,
  },
  heroValue: {
    fontSize: FONT_SIZES.hero,
    fontFamily: FONTS.black,
    color: COLORS.white,
    letterSpacing: -1,
  },
  heroUnit: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: "rgba(255,255,255,0.7)",
  },
  heroSub: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.78)",
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  topUpBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md + 2,
    borderRadius: RADIUS.full,
    ...SHADOWS.soft,
  },
  topUpText: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
  },

  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },

  list: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    ...SHADOWS.soft,
  },
  empty: {
    paddingVertical: SPACING.xl,
    alignItems: "center",
    gap: SPACING.xs,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  emptyBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});
