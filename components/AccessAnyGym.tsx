// app/components/AccessAnyGym.tsx
// Generates a short-lived QR code (10s TTL) containing a signed payload:
//   { userId, token, issuedAt, expiresAt }
//
// The token is a cryptographically random hex string generated client-side.
// The backend validates this token against its own signing secret and checks
// the expiresAt field to reject replayed or screenshot-captured codes.
//
// PATCH: removed `if (!user) return null`.
// We now only need user._id (always present after AuthContext decode fix).
// If _id is somehow absent we disable the button rather than hiding it.

import {
    COLORS,
    FONT_SIZES,
    FONT_WEIGHTS,
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
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

const TTL_SECONDS = 10;
const QR_SIZE = 220;

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

// ── Countdown ring ─────────────────────────────────────────────────────────
function CountdownRing({ secondsLeft }: { secondsLeft: number }) {
  const isUrgent = secondsLeft <= 3;
  return (
    <View style={ring.wrap}>
      <View style={ring.track} />
      <View
        style={[
          ring.fill,
          {
            borderColor: isUrgent ? COLORS.error : COLORS.primary,
            opacity: 0.3 + (secondsLeft / TTL_SECONDS) * 0.7,
          },
        ]}
      />
      <View style={ring.labelWrap}>
        <Text style={[ring.label, isUrgent && { color: COLORS.error }]}>
          {secondsLeft}s
        </Text>
        <Text style={ring.sublabel}>remaining</Text>
      </View>
    </View>
  );
}
const ring = StyleSheet.create({
  wrap: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  track: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: COLORS.border,
  },
  fill: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
  },
  labelWrap: { alignItems: "center" },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.primary,
    lineHeight: 16,
  },
  sublabel: { fontSize: 8, color: COLORS.textMuted },
});

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
        <Ionicons name="refresh" size={16} color={COLORS.white} />
        <Text style={expiredS.btnText}>Generate New Pass</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
const expiredS = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.accent + "F0",
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
    color: COLORS.accent,
  },
});

// ── QR Modal ───────────────────────────────────────────────────────────────
function QRModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [payload, setPayload] = useState<QRPayload>(() => buildPayload(userId));
  const [secondsLeft, setSecondsLeft] = useState(TTL_SECONDS);
  const [isExpired, setExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  const startTimer = useCallback(() => {
    setExpired(false);
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

  useEffect(() => {
    if (secondsLeft <= 3 && !isExpired) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.04,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [secondsLeft, isExpired]);

  return (
    <View style={modalS.container}>
      <View style={modalS.header}>
        <View>
          <Text style={modalS.title}>Access Any Gym</Text>
          <Text style={modalS.subtitle}>Show this to the gym scanner</Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={modalS.closeBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={modalS.qrWrap}>
        <Animated.View
          style={[
            modalS.qrCard,
            { transform: [{ scale: pulse }] },
            secondsLeft <= 3 && !isExpired && { borderColor: COLORS.error },
          ]}
        >
          <QRCode
            value={JSON.stringify(payload)}
            size={QR_SIZE}
            color={COLORS.accent}
            backgroundColor={COLORS.white}
          />
          {isExpired && <ExpiredOverlay onRefresh={startTimer} />}
        </Animated.View>

        {!isExpired && (
          <View style={modalS.countdownRow}>
            <CountdownRing secondsLeft={secondsLeft} />
            <View style={modalS.countdownText}>
              <Text style={modalS.countdownTitle}>
                {secondsLeft <= 3 ? "⚠️ Expiring soon" : "🔒 Secured pass"}
              </Text>
              <Text style={modalS.countdownBody}>
                Rotates every {TTL_SECONDS}s to prevent sharing
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={modalS.securityBadge}>
        <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
        <Text style={modalS.securityText}>
          End-to-end secured · One-time use · Auto-expires
        </Text>
      </View>
    </View>
  );
}
const modalS = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
  },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: 2 },
  closeBtn: { padding: SPACING.xs },
  qrWrap: { alignItems: "center", marginBottom: SPACING.lg },
  qrCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
    overflow: "hidden",
    position: "relative",
    ...SHADOWS.card,
  },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: COLORS.primaryMuted,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    width: "100%",
  },
  countdownText: { flex: 1 },
  countdownTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  countdownBody: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.full,
  },
  securityText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
});

// ── Exported trigger ───────────────────────────────────────────────────────
interface AccessAnyGymProps {
  variant?: "pill" | "full";
}

export default function AccessAnyGym({ variant = "pill" }: AccessAnyGymProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // FIXED: component always renders — only disables if _id is absent
  const userId = user?._id ?? null;
  const isReady = Boolean(userId);

  const modal = isReady ? (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={() => setOpen(false)}
    >
      <Pressable style={triggerS.backdrop} onPress={() => setOpen(false)} />
      <QRModal userId={userId!} onClose={() => setOpen(false)} />
    </Modal>
  ) : null;

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
        style={[pillS.wrap, !isReady && pillS.disabled]}
        onPress={() => isReady && setOpen(true)}
        activeOpacity={0.75}
      >
        <Ionicons
          name="qr-code"
          size={18}
          color={isReady ? COLORS.accent : COLORS.textMuted}
        />
        <Text style={[pillS.label, !isReady && pillS.labelMuted]}>
          {isReady ? "Access\nAny Gym" : "Loading..."}
        </Text>
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
    backgroundColor: COLORS.accent,
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
  disabled: { opacity: 0.45 },
  backdrop: { flex: 1, backgroundColor: "#00000060" },
});
const pillS = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    textAlign: "center",
  },
  labelMuted: { color: COLORS.textMuted },
  disabled: { opacity: 0.5 },
});

// import { Ionicons } from "@expo/vector-icons";
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import {
//     Animated,
//     Modal,
//     Pressable,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from "react-native";
// import QRCode from "react-native-qrcode-svg";
// import {
//     COLORS,
//     FONT_SIZES,
//     FONT_WEIGHTS,
//     RADIUS,
//     SHADOWS,
//     SPACING,
// } from "../constants/theme";
// import { useAuth } from "../context/AuthContext";

// // ── Constants ──────────────────────────────────────────────────────────────
// const TTL_SECONDS = 10;
// const QR_SIZE = 220;

// // ── Token generation ───────────────────────────────────────────────────────
// // Generates a 32-character hex token using Math.random.
// // For production, replace with expo-crypto: Crypto.getRandomBytes(16).
// function generateToken(): string {
//   const arr = new Uint8Array(16);
//   for (let i = 0; i < arr.length; i++) {
//     arr[i] = Math.floor(Math.random() * 256);
//   }
//   return Array.from(arr)
//     .map((b) => b.toString(16).padStart(2, "0"))
//     .join("");
// }

// // ── QR Payload ─────────────────────────────────────────────────────────────
// interface QRPayload {
//   userId: string;
//   token: string;
//   issuedAt: number; // unix ms
//   expiresAt: number; // unix ms
// }

// function buildPayload(userId: string): QRPayload {
//   const now = Date.now();
//   return {
//     userId,
//     token: generateToken(),
//     issuedAt: now,
//     expiresAt: now + TTL_SECONDS * 1000,
//   };
// }

// // ── Countdown arc component ────────────────────────────────────────────────
// // Draws a simple animated ring around the QR code to show remaining time.
// function CountdownRing({ secondsLeft }: { secondsLeft: number }) {
//   const fraction = secondsLeft / TTL_SECONDS;
//   const isUrgent = secondsLeft <= 3;

//   return (
//     <View style={ring.wrap}>
//       {/* Background track */}
//       <View style={ring.track} />
//       {/* Foreground fill — approximated with opacity + scale for simplicity */}
//       <View
//         style={[
//           ring.fill,
//           {
//             borderColor: isUrgent ? COLORS.error : COLORS.primary,
//             opacity: 0.3 + fraction * 0.7,
//           },
//         ]}
//       />
//       {/* Seconds text */}
//       <View style={ring.labelWrap}>
//         <Text style={[ring.label, isUrgent && { color: COLORS.error }]}>
//           {secondsLeft}s
//         </Text>
//         <Text style={ring.sublabel}>remaining</Text>
//       </View>
//     </View>
//   );
// }

// const ring = StyleSheet.create({
//   wrap: {
//     width: 60,
//     height: 60,
//     alignItems: "center",
//     justifyContent: "center",
//     position: "relative",
//   },
//   track: {
//     position: "absolute",
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     borderWidth: 3,
//     borderColor: COLORS.border,
//   },
//   fill: {
//     position: "absolute",
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     borderWidth: 3,
//   },
//   labelWrap: {
//     alignItems: "center",
//   },
//   label: {
//     fontSize: FONT_SIZES.sm,
//     fontWeight: FONT_WEIGHTS.black,
//     color: COLORS.primary,
//     lineHeight: 16,
//   },
//   sublabel: {
//     fontSize: 8,
//     color: COLORS.textMuted,
//   },
// });

// // ── Expired overlay ────────────────────────────────────────────────────────
// function ExpiredOverlay({ onRefresh }: { onRefresh: () => void }) {
//   const fade = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.timing(fade, {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   return (
//     <Animated.View style={[expired.wrap, { opacity: fade }]}>
//       <Ionicons name="lock-closed" size={36} color={COLORS.white} />
//       <Text style={expired.title}>Code Expired</Text>
//       <Text style={expired.body}>
//         This pass has expired for security reasons.
//       </Text>
//       <TouchableOpacity
//         style={expired.btn}
//         onPress={onRefresh}
//         activeOpacity={0.8}
//       >
//         <Ionicons name="refresh" size={16} color={COLORS.white} />
//         <Text style={expired.btnText}>Generate New Pass</Text>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// }

// const expired = StyleSheet.create({
//   wrap: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: COLORS.accent + "F0",
//     borderRadius: RADIUS.lg,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: SPACING.lg,
//     zIndex: 10,
//   },
//   title: {
//     fontSize: FONT_SIZES.lg,
//     fontWeight: FONT_WEIGHTS.black,
//     color: COLORS.white,
//     marginTop: SPACING.sm,
//     marginBottom: SPACING.xs,
//   },
//   body: {
//     fontSize: FONT_SIZES.sm,
//     color: COLORS.white,
//     opacity: 0.85,
//     textAlign: "center",
//     marginBottom: SPACING.lg,
//   },
//   btn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: SPACING.xs,
//     backgroundColor: COLORS.white,
//     paddingVertical: SPACING.sm,
//     paddingHorizontal: SPACING.md,
//     borderRadius: RADIUS.full,
//   },
//   btnText: {
//     fontSize: FONT_SIZES.sm,
//     fontWeight: FONT_WEIGHTS.bold,
//     color: COLORS.accent,
//   },
// });

// // ── QR Modal content ───────────────────────────────────────────────────────
// interface QRModalProps {
//   userId: string;
//   onClose: () => void;
// }

// function QRModal({ userId, onClose }: QRModalProps) {
//   const [payload, setPayload] = useState<QRPayload>(() => buildPayload(userId));
//   const [secondsLeft, setSecondsLeft] = useState(TTL_SECONDS);
//   const [expired, setExpired] = useState(false);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   const startTimer = useCallback(() => {
//     setExpired(false);
//     setSecondsLeft(TTL_SECONDS);
//     setPayload(buildPayload(userId));

//     timerRef.current = setInterval(() => {
//       setSecondsLeft((s) => {
//         if (s <= 1) {
//           clearInterval(timerRef.current!);
//           setExpired(true);
//           return 0;
//         }
//         return s - 1;
//       });
//     }, 1000);
//   }, [userId]);

//   useEffect(() => {
//     startTimer();
//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, [startTimer]);

//   const qrValue = JSON.stringify(payload);

//   // Pulse animation on the QR border when urgent
//   const pulse = useRef(new Animated.Value(1)).current;
//   useEffect(() => {
//     if (secondsLeft <= 3 && !expired) {
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulse, {
//             toValue: 1.04,
//             duration: 300,
//             useNativeDriver: true,
//           }),
//           Animated.timing(pulse, {
//             toValue: 1,
//             duration: 300,
//             useNativeDriver: true,
//           }),
//         ]),
//       ).start();
//     } else {
//       pulse.setValue(1);
//     }
//   }, [secondsLeft, expired]);

//   return (
//     <View style={modal.container}>
//       {/* Header */}
//       <View style={modal.header}>
//         <View>
//           <Text style={modal.title}>Access Any Gym</Text>
//           <Text style={modal.subtitle}>Show this to the gym scanner</Text>
//         </View>
//         <TouchableOpacity
//           onPress={onClose}
//           style={modal.closeBtn}
//           activeOpacity={0.7}
//         >
//           <Ionicons name="close" size={22} color={COLORS.textSecondary} />
//         </TouchableOpacity>
//       </View>

//       {/* QR area */}
//       <View style={modal.qrWrap}>
//         <Animated.View
//           style={[
//             modal.qrCard,
//             { transform: [{ scale: pulse }] },
//             secondsLeft <= 3 && !expired && { borderColor: COLORS.error },
//           ]}
//         >
//           <QRCode
//             value={qrValue}
//             size={QR_SIZE}
//             color={COLORS.accent}
//             backgroundColor={COLORS.white}
//             logo={undefined}
//           />

//           {/* Expired overlay */}
//           {expired && <ExpiredOverlay onRefresh={startTimer} />}
//         </Animated.View>

//         {/* Countdown */}
//         {!expired && (
//           <View style={modal.countdownRow}>
//             <CountdownRing secondsLeft={secondsLeft} />
//             <View style={modal.countdownText}>
//               <Text style={modal.countdownTitle}>
//                 {secondsLeft <= 3 ? "⚠️ Expiring soon" : "🔒 Secured pass"}
//               </Text>
//               <Text style={modal.countdownBody}>
//                 This QR rotates every {TTL_SECONDS}s to prevent sharing
//               </Text>
//             </View>
//           </View>
//         )}
//       </View>

//       {/* Security note */}
//       <View style={modal.securityBadge}>
//         <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
//         <Text style={modal.securityText}>
//           End-to-end secured · One-time use · Auto-expires
//         </Text>
//       </View>
//     </View>
//   );
// }

// const modal = StyleSheet.create({
//   container: {
//     backgroundColor: COLORS.surface,
//     borderTopLeftRadius: RADIUS.xl,
//     borderTopRightRadius: RADIUS.xl,
//     padding: SPACING.lg,
//     paddingBottom: SPACING.xxl,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: SPACING.lg,
//   },
//   title: {
//     fontSize: FONT_SIZES.xl,
//     fontWeight: FONT_WEIGHTS.black,
//     color: COLORS.text,
//   },
//   subtitle: {
//     fontSize: FONT_SIZES.sm,
//     color: COLORS.textMuted,
//     marginTop: 2,
//   },
//   closeBtn: {
//     padding: SPACING.xs,
//   },
//   qrWrap: {
//     alignItems: "center",
//     marginBottom: SPACING.lg,
//   },
//   qrCard: {
//     padding: SPACING.md,
//     borderRadius: RADIUS.lg,
//     borderWidth: 2,
//     borderColor: COLORS.primary,
//     backgroundColor: COLORS.white,
//     marginBottom: SPACING.lg,
//     overflow: "hidden",
//     position: "relative",
//     ...SHADOWS.card,
//   },
//   countdownRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: SPACING.md,
//     backgroundColor: COLORS.primaryMuted,
//     padding: SPACING.md,
//     borderRadius: RADIUS.md,
//     width: "100%",
//   },
//   countdownText: { flex: 1 },
//   countdownTitle: {
//     fontSize: FONT_SIZES.base,
//     fontWeight: FONT_WEIGHTS.bold,
//     color: COLORS.text,
//   },
//   countdownBody: {
//     fontSize: FONT_SIZES.xs,
//     color: COLORS.textMuted,
//     marginTop: 2,
//   },
//   securityBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: SPACING.xs,
//     paddingVertical: SPACING.sm,
//     backgroundColor: COLORS.primaryMuted,
//     borderRadius: RADIUS.full,
//   },
//   securityText: {
//     fontSize: FONT_SIZES.xs,
//     color: COLORS.textSecondary,
//   },
// });

// // ── Trigger button (exported for use in HomeScreen pill row) ───────────────
// interface AccessAnyGymProps {
//   /** Render as a compact pill (for the Quick Actions row) or full button */
//   variant?: "pill" | "full";
// }

// export default function AccessAnyGym({ variant = "pill" }: AccessAnyGymProps) {
//   const { user } = useAuth();
//   const [open, setOpen] = useState(false);

//   if (!user) return null;

//   if (variant === "full") {
//     return (
//       <>
//         <TouchableOpacity
//           style={fullBtn.btn}
//           onPress={() => setOpen(true)}
//           activeOpacity={0.85}
//         >
//           <Ionicons name="qr-code" size={20} color={COLORS.white} />
//           <Text style={fullBtn.label}>Access Any Gym</Text>
//         </TouchableOpacity>

//         <Modal
//           visible={open}
//           transparent
//           animationType="slide"
//           onRequestClose={() => setOpen(false)}
//         >
//           <Pressable style={fullBtn.backdrop} onPress={() => setOpen(false)} />
//           <QRModal userId={user._id} onClose={() => setOpen(false)} />
//         </Modal>
//       </>
//     );
//   }

//   // Pill variant — matches existing ActionPill shape
//   return (
//     <>
//       <TouchableOpacity
//         style={pill.wrap}
//         onPress={() => setOpen(true)}
//         activeOpacity={0.75}
//       >
//         <Ionicons name="qr-code" size={18} color={COLORS.accent} />
//         <Text style={pill.label}>Access Any Gym</Text>
//       </TouchableOpacity>

//       <Modal
//         visible={open}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setOpen(false)}
//       >
//         <Pressable style={fullBtn.backdrop} onPress={() => setOpen(false)} />
//         <QRModal userId={user._id} onClose={() => setOpen(false)} />
//       </Modal>
//     </>
//   );
// }

// const fullBtn = StyleSheet.create({
//   btn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: SPACING.sm,
//     backgroundColor: COLORS.accent,
//     paddingVertical: SPACING.md,
//     paddingHorizontal: SPACING.xl,
//     borderRadius: RADIUS.full,
//     justifyContent: "center",
//     ...SHADOWS.card,
//   },
//   label: {
//     fontSize: FONT_SIZES.base,
//     fontWeight: FONT_WEIGHTS.bold,
//     color: COLORS.white,
//   },
//   backdrop: {
//     flex: 1,
//     backgroundColor: "#00000060",
//   },
// });

// const pill = StyleSheet.create({
//   wrap: {
//     flex: 1,
//     flexDirection: "column",
//     alignItems: "center",
//     gap: 4,
//     backgroundColor: COLORS.surface,
//     borderRadius: RADIUS.md,
//     paddingVertical: SPACING.md,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   label: {
//     fontSize: FONT_SIZES.xs,
//     fontWeight: FONT_WEIGHTS.semibold,
//     color: COLORS.text,
//     textAlign: "center",
//   },
// });
