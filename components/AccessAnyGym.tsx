// components/AccessAnyGym.tsx
//
// Generates a short-lived QR code (10s TTL) containing a signed payload:
//   { userId, token, issuedAt, expiresAt }
//
// QR sheet redesigned to match the "Checked in" pattern: lavender hero
// at the top with close X + big headline, two stacked white cards below
// (gym info + QR card with countdown footer). All visual orange/accent
// surfaces use COLORS.primary (lavender) — the auth/QR modal now reads
// as a single brand surface.

import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  RADIUS,
  SHADOWS,
  SPACING,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import GradientSurface from "@/components/ui/GradientSurface";
import DarkVeil from "@/components/ui/DarkVeil";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";

const TTL_SECONDS = 10;
const QR_SIZE = 220;

// ── Payload ────────────────────────────────────────────────────────────────
function generateToken(): string {
  const arr = new Uint8Array(16);
  for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface QRPayload {
  userId: string;
  token: string;
  issuedAt: number;
  expiresAt: number;
}
function buildPayload(userId: string): QRPayload {
  const now = Date.now();
  return {
    userId,
    token: generateToken(),
    issuedAt: now,
    expiresAt: now + TTL_SECONDS * 1000,
  };
}

// ── Expired overlay ────────────────────────────────────────────────────────
function ExpiredOverlay({ onRefresh }: { onRefresh: () => void }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View style={[expiredS.wrap, { opacity: fade }]}>
      <Ionicons name="lock-closed" size={36} color={COLORS.white} />
      <Text style={expiredS.title}>Code Expired</Text>
      <Text style={expiredS.body}>This pass expired for security reasons.</Text>
      <TouchableOpacity
        style={expiredS.btn}
        onPress={onRefresh}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={16} color={COLORS.primary} />
        <Text style={expiredS.btnText}>Generate New Pass</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
const expiredS = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primaryDark + "F0",
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
    zIndex: 10,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  body: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.85,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  btnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
});

// ── Checked-in sheet (full screen) ─────────────────────────────────────────
function CheckedInSheet({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const [payload, setPayload] = useState<QRPayload>(() => buildPayload(userId));
  const [secondsLeft, setSecondsLeft] = useState(TTL_SECONDS);
  const [isExpired, setExpired] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const [isCheckedIn, setCheckedIn] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    setExpired(false);
    setCheckedIn(false);
    setSecondsLeft(TTL_SECONDS);
    setPayload(buildPayload(userId));
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setExpired(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [userId]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const urgent = secondsLeft <= 3 && !isExpired;

  return (
    <View style={sheetS.root}>
      <StatusBar barStyle="light-content" />

      {/* Animated DarkVeil background */}
      <View style={sheetS.pillarLayer} pointerEvents="none">
        <DarkVeil />
      </View>

      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        {/* ── Top bar (close) ───────────────────────────── */}
        <View style={sheetS.topBar}>
          <TouchableOpacity
            onPress={onClose}
            style={sheetS.closeBtn}
            activeOpacity={0.8}
            hitSlop={10}
          >
            <Ionicons name="close" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* ── Headline ───────────────────────────────────── */}
        <View style={sheetS.headline}>
          <Text style={sheetS.title}>
            {isCheckedIn ? "Checked in successfully" : "Check in"}
          </Text>
          <Text style={sheetS.subtitle}>
            {isCheckedIn
              ? "Enjoy your session — you're all set."
              : `Show this code at the front desk.\nIt rotates every ${TTL_SECONDS} seconds.`}
          </Text>
        </View>

        {/* ── Card stack ─────────────────────────────────── */}
        <View style={sheetS.cards}>
          {/* Gym info card */}
          <View style={sheetS.gymCard}>
            <View style={sheetS.gymBadge}>
              <Ionicons name="barbell" size={22} color={COLORS.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={sheetS.gymName}>Iron Forge Casablanca</Text>
              <Text style={sheetS.gymMeta}>Gym access · 2 pts</Text>
            </View>
          </View>

          {/* QR card */}
          <View style={sheetS.qrCard}>
            {/* Hide / Show toggle */}
            <TouchableOpacity
              onPress={() => setShowCode((v) => !v)}
              style={sheetS.hideRow}
              activeOpacity={0.7}
            >
              <Ionicons
                name="scan-outline"
                size={16}
                color={COLORS.text}
              />
              <Text style={sheetS.hideText}>
                {showCode ? "Hide Code" : "Show Code"}
              </Text>
            </TouchableOpacity>

            {/* QR */}
            {showCode ? (
              <Pressable
                onPress={() => !isExpired && setCheckedIn((v) => !v)}
                style={[
                  sheetS.qrWrap,
                  urgent && { borderColor: COLORS.error },
                  isCheckedIn && { borderColor: "#22A06B" },
                ]}
              >
                {/* QR must stay dark-on-white for scanner contrast — never theme it. */}
                <QRCode
                  value={JSON.stringify(payload)}
                  size={QR_SIZE}
                  color="#1A1728"
                  backgroundColor={COLORS.white}
                />
                {isExpired && <ExpiredOverlay onRefresh={startTimer} />}
                {isCheckedIn && !isExpired && (
                  <View style={sheetS.checkedOverlay}>
                    <View style={sheetS.checkedBadge}>
                      <Ionicons
                        name="checkmark"
                        size={48}
                        color={COLORS.white}
                      />
                    </View>
                  </View>
                )}
              </Pressable>
            ) : (
              <View style={sheetS.qrHidden}>
                <Ionicons
                  name="eye-off-outline"
                  size={36}
                  color={COLORS.textMuted}
                />
                <Text style={sheetS.qrHiddenText}>Tap "Show Code"</Text>
              </View>
            )}

            {/* Countdown footer */}
            {!isExpired && showCode && (
              <View style={sheetS.countdown}>
                <View
                  style={[
                    sheetS.countdownBubble,
                    urgent && { backgroundColor: COLORS.error },
                  ]}
                >
                  <Text style={sheetS.countdownBubbleText}>
                    {secondsLeft}s
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={sheetS.countdownTitle}>
                    {urgent ? "Expiring soon" : "Secured pass"}
                  </Text>
                  <Text style={sheetS.countdownBody}>
                    Rotates every {TTL_SECONDS}s · One-time use
                  </Text>
                </View>
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color={COLORS.primaryDark}
                />
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const sheetS = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0E0A1F",
    overflow: "hidden",
  },
  pillarLayer: {
    ...StyleSheet.absoluteFillObject,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  headline: {
    paddingHorizontal: SPACING.xl - 4,
    paddingTop: SPACING.lg,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: SPACING.sm + 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#5DEC9F",
  },
  livePillText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 40,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.white,
    letterSpacing: -1,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: "rgba(255,255,255,0.82)",
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: SPACING.sm,
    lineHeight: 21,
  },

  cards: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: SPACING.md + 4,
    paddingBottom: SPACING.lg,
    gap: 12,
  },
  gymCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 14,
    ...SHADOWS.pop,
  },
  gymBadge: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  gymName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  gymMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  qrCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md + 4,
    ...SHADOWS.pop,
  },
  hideRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceElevated,
    marginBottom: SPACING.md,
  },
  hideText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  qrWrap: {
    alignSelf: "center",
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    overflow: "hidden",
    position: "relative",
  },
  qrHidden: {
    height: QR_SIZE + 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: SPACING.md,
  },
  checkedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(34,160,107,0.92)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.md,
  },
  checkedBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 3,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  qrHiddenText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },

  countdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(159,153,199,0.13)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  countdownBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  countdownBubbleText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.black,
  },
  countdownTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  countdownBody: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
});

// ── Exported trigger ───────────────────────────────────────────────────────
interface AccessAnyGymProps {
  variant?: "pill" | "full" | "icon";
  /** Override the circular icon button styles (icon variant only). */
  iconStyle?: object;
  iconColor?: string;
  iconBg?: string;
}

export default function AccessAnyGym({
  variant = "pill",
  iconStyle,
  iconColor,
  iconBg,
}: AccessAnyGymProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const userId = user?._id ?? null;
  const isReady = Boolean(userId);

  const modal = isReady ? (
    <Modal
      visible={open}
      animationType="slide"
      onRequestClose={() => setOpen(false)}
      statusBarTranslucent
    >
      <CheckedInSheet userId={userId!} onClose={() => setOpen(false)} />
    </Modal>
  ) : null;

  if (variant === "icon") {
    return (
      <>
        <TouchableOpacity
          style={[
            triggerS.iconBtn,
            iconBg ? { backgroundColor: iconBg } : null,
            !isReady && triggerS.disabled,
            iconStyle,
          ]}
          onPress={() => isReady && setOpen(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Scan QR to access a gym"
        >
          <Ionicons
            name="qr-code"
            size={22}
            color={iconColor ?? COLORS.white}
          />
        </TouchableOpacity>
        {modal}
      </>
    );
  }

  if (variant === "full") {
    return (
      <>
        <TouchableOpacity
          style={[triggerS.fullBtn, !isReady && triggerS.disabled]}
          onPress={() => isReady && setOpen(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="qr-code" size={20} color={COLORS.white} />
          <Text style={triggerS.fullLabel}>Access Any Gym</Text>
        </TouchableOpacity>
        {modal}
      </>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[pillS.touch, !isReady && pillS.disabled]}
        onPress={() => isReady && setOpen(true)}
        activeOpacity={0.85}
      >
        <GradientSurface radius={RADIUS.md} style={pillS.surface}>
          <View style={pillS.content}>
            <Ionicons name="qr-code" size={20} color={COLORS.white} />
            <Text style={pillS.label}>{isReady ? "Access Gym" : "Loading…"}</Text>
          </View>
        </GradientSurface>
      </TouchableOpacity>
      {modal}
    </>
  );
}

const triggerS = StyleSheet.create({
  fullBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    ...SHADOWS.card,
  },
  fullLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.card,
  },
  disabled: { opacity: 0.45 },
});

const pillS = StyleSheet.create({
  touch: { flex: 1 },
  surface: { flex: 1 },
  content: {
    alignItems: "center",
    gap: 4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    textAlign: "center",
  },
  disabled: { opacity: 0.5 },
});
