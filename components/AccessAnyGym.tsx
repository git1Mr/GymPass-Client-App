import AuroraBackground from "@/components/ui/AuroraBackground";
import GradientFill from "@/components/ui/GradientFill";
import GradientSurface from "@/components/ui/GradientSurface";
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    GRADIENTS,
    RADIUS,
    SHADOWS,
    SPACING,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
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
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

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
    fontFamily: FONTS.black,
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
    fontFamily: FONTS.bold,
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
    // Callable while a pass is still live ("Generate New Pass") — kill the
    // running interval first so two timers never race.
    if (timerRef.current) clearInterval(timerRef.current);
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
      <AuroraBackground />

      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        {/* ── Plain back chevron, per the kit's QR screen ── */}
        <View style={sheetS.topBar}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.8} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* ── Big rounded card: QR, then title + caption inside ── */}
        <View style={sheetS.qrCard}>
          {showCode ? (
            <Pressable
              onPress={() => !isExpired && setCheckedIn((v) => !v)}
              style={[
                sheetS.qrTile,
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
                    <Ionicons name="checkmark" size={48} color={COLORS.white} />
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
            </View>
          )}

          <Text style={sheetS.cardTitle}>
            {isCheckedIn ? "Checked in successfully" : "Scan to check in"}
          </Text>
          <Text style={sheetS.cardCaption}>
            {isCheckedIn
              ? "Enjoy your session — you're all set."
              : isExpired
                ? "This pass expired for security reasons.\nGenerate a new one below."
                : `Show this code at the front desk.\nRotates in ${secondsLeft}s · One-time use`}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* ── Bottom actions: filled gradient pill + outlined pill ── */}
        <View style={sheetS.btnCol}>
          <TouchableOpacity
            style={sheetS.primaryBtn}
            onPress={startTimer}
            activeOpacity={0.85}
          >
            <GradientFill colors={GRADIENTS.primary} />
            <Text style={sheetS.primaryBtnText}>Generate New Pass</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={sheetS.secondaryBtn}
            onPress={() => setShowCode((v) => !v)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={showCode ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={COLORS.primaryLight}
            />
            <Text style={sheetS.secondaryBtnText}>
              {showCode ? "Hide Code" : "Show Code"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const sheetS = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: "hidden",
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 4,
  },

  // Kit QR screen: one big rounded light-gray card holding the code,
  // title, and caption.
  qrCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surfaceOverlay,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  qrTile: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.transparent,
    backgroundColor: COLORS.white,
    overflow: "hidden",
    position: "relative",
  },
  qrHidden: {
    height: QR_SIZE + 16 + SPACING.sm * 2,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
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

  cardTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    textAlign: "center",
  },
  cardCaption: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    marginTop: SPACING.sm,
  },

  // Bottom pills: filled gradient primary over an outlined secondary.
  btnCol: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm + 4,
  },
  primaryBtn: {
    height: 56,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  primaryBtnText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semibold,
    color: COLORS.textOnPrimary,
  },
  secondaryBtn: {
    height: 56,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  secondaryBtnText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semibold,
    color: COLORS.primaryLight,
  },
});

// ── Exported trigger ───────────────────────────────────────────────────────
interface AccessAnyGymProps {
  variant?: "pill" | "full" | "icon" | "fab";
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

  if (variant === "fab") {
    // CaFit-style floating tab-bar action: a raised gradient circle that
    // breaks out of the bar. Opens the same QR check-in sheet.
    return (
      <>
        <TouchableOpacity
          style={[triggerS.fabBtn, !isReady && triggerS.disabled]}
          onPress={() => isReady && setOpen(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Scan QR to access a gym"
        >
          <GradientFill colors={GRADIENTS.primary} />
          <Ionicons name="qr-code" size={26} color={COLORS.textOnPrimary} />
        </TouchableOpacity>
        {modal}
      </>
    );
  }

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
          <Text style={triggerS.fullLabel}>Générer mon pass</Text>
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
            <Text style={pillS.label}>
              {isReady ? "Scanner" : "Chargement…"}
            </Text>
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
    fontFamily: FONTS.bold,
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
  fabBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
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
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: "center",
  },
  disabled: { opacity: 0.5 },
});
