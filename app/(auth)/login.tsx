// app/(auth)/login.tsx
//
// On successful signIn, this screen does NOT manually navigate.
// AuthContext.setToken(token) fires → AuthGate's useEffect runs →
// router.replace('/(tabs)') is called — the auth stack is wiped from history.

import * as Device from "expo-device";
import { useRouter } from "expo-router";
import React, { JSX, useEffect, useState } from "react";
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

import FormInput from "@/components/ui/FormInput";
import PrimaryButton from "@/components/ui/PrimaryButton";
import toast from "@/components/ui/Toast";
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getRememberedEmail } from "@/services/authService";
import { loginSchema, validate } from "@/validation/authSchema";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Maps raw backend response strings (from our Node routes) to
// user-facing messages. Keep in sync with gympass/routes/auth.js.
function parseBackendError(err: unknown): {
  field?: keyof FormErrors;
  message: string;
} {
  const axiosErr = err as {
    response?: { data?: unknown; status?: number };
    message?: string;
  };
  const status = axiosErr.response?.status;
  const raw = axiosErr.response?.data;
  const rawStr = typeof raw === "string" ? raw.toLowerCase() : "";

  // 400 — validation / credential errors
  if (status === 400) {
    if (rawStr.includes("email"))
      return { field: "email", message: "No account found with this email." };
    if (rawStr.includes("password") || rawStr.includes("invalid"))
      return {
        field: "password",
        message: "Incorrect password. Please try again.",
      };
    return { message: typeof raw === "string" ? raw : "Invalid credentials." };
  }

  // 403 — device binding or suspended
  if (status === 403) {
    if (rawStr.includes("device"))
      return { message: "This account is linked to a different device." };
    if (rawStr.includes("suspended"))
      return { message: "Your account has been suspended. Contact support." };
  }

  // Network / unknown
  const fallback =
    axiosErr.message ?? "Could not connect to the server. Check your network.";
  return { message: fallback };
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function LoginScreen(): JSX.Element {
  const { signIn } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPass, setShowPass] = useState<boolean>(false);
  const [rememberMe, setRemember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Pre-fill remembered email on mount
  useEffect((): void => {
    (async (): Promise<void> => {
      const saved: string | null = await getRememberedEmail();
      if (saved) {
        setForm((f) => ({ ...f, email: saved }));
        setRemember(true);
      }
    })();
  }, []);

  function setField(field: keyof LoginForm) {
    return (value: string): void => {
      setForm((f) => ({ ...f, [field]: value }));
      // Clear the field-level error as the user types
      if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    };
  }

  async function handleLogin(): Promise<void> {
    // 1. Client-side Joi validation (fast, no network round-trip)
    const clientErrors = validate(
      loginSchema,
      form as unknown as Record<string, unknown>,
    );
    if (clientErrors) {
      setErrors(clientErrors as FormErrors);
      return;
    }

    setLoading(true);
    try {
      const deviceId: string =
        Device.modelId ?? Device.osInternalBuildId ?? "unknown-device";

      // 2. Call backend — authService stores JWT, context sets token
      await signIn({ ...form, deviceId, rememberMe });

      // 3. Do NOT call router.replace here.
      //    AuthContext.setToken() fires → AuthGate's useEffect redirects.
      //    This keeps navigation logic in one place.
    } catch (err: unknown) {
      const { field, message } = parseBackendError(err);
      if (field) {
        setErrors((e) => ({ ...e, [field]: message }));
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back.</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* ── Form ── */}
          <View style={styles.form}>
            <FormInput
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoComplete="email"
              value={form.email}
              onChangeText={setField("email")}
              error={errors.email}
            />

            <FormInput
              label="Password"
              placeholder="••••••••"
              secureTextEntry={!showPass}
              autoComplete="password"
              value={form.password}
              onChangeText={setField("password")}
              error={errors.password}
              rightIcon={showPass ? "🙈" : "👁️"}
              onRightIconPress={(): void => setShowPass((v) => !v)}
            />

            {/* Remember me + Forgot password */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={(): void => setRemember((v) => !v)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.checkbox, rememberMe && styles.checkboxActive]}
                >
                  {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <Text style={styles.rememberLabel}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={(): void => router.push("/(auth)/forgot-password")}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <PrimaryButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.btn}
            />
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Dont have an account? </Text>
            <TouchableOpacity
              onPress={(): void => router.push("/(auth)/register")}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Create one</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  header: { marginBottom: SPACING.xxl },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: FONT_SIZES.base, color: COLORS.textSecondary },
  form: { flex: 1 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
    marginTop: -SPACING.xs,
  },
  rememberRow: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.xs,
  },
  checkboxActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.bold,
  },
  rememberLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  forgotLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: FONT_WEIGHTS.medium,
  },
  btn: { marginTop: SPACING.xs },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  footerText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  footerLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

// // app/(auth)/login.tsx

// import * as Device from "expo-device";
// import { useRouter } from "expo-router";
// import React, { JSX, useEffect, useState } from "react";
// import {
//     KeyboardAvoidingView,
//     Platform,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// import FormInput from "@/components/ui/FormInput";
// import PrimaryButton from "@/components/ui/PrimaryButton";
// import toast from "@/components/ui/Toast";
// import { useAuth } from "@/context/AuthContext";
// import { getRememberedEmail } from "@/services/authService";
// import { loginSchema, validate } from "@/validation/authSchema";
// import {
//     COLORS,
//     FONT_SIZES,
//     FONT_WEIGHTS,
//     SPACING,
// } from "../../constants/theme";

// interface LoginForm {
//   email: string;
//   password: string;
// }

// interface FormErrors {
//   email?: string;
//   password?: string;
// }

// export default function LoginScreen(): JSX.Element {
//   const { signIn } = useAuth();
//   const router = useRouter();

//   const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [showPass, setShowPass] = useState<boolean>(false);
//   const [rememberMe, setRemember] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);

//   useEffect((): void => {
//     (async (): Promise<void> => {
//       const saved: string | null = await getRememberedEmail();
//       if (saved) {
//         setForm((f) => ({ ...f, email: saved }));
//         setRemember(true);
//       }
//     })();
//   }, []);

//   function set(field: keyof LoginForm) {
//     return (value: string): void => {
//       setForm((f) => ({ ...f, [field]: value }));
//       if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
//     };
//   }

//   async function handleLogin(): Promise<void> {
//     const errs = validate(
//       loginSchema,
//       form as unknown as Record<string, unknown>,
//     );
//     if (errs) {
//       setErrors(errs as FormErrors);
//       return;
//     }

//     setLoading(true);
//     try {
//       const deviceId: string =
//         Device.modelId ?? Device.osInternalBuildId ?? "unknown-device";
//       await signIn({ ...form, deviceId, rememberMe });
//       // AuthGate in _layout.tsx handles the redirect to (tabs)
//     } catch (err: unknown) {
//       const axiosErr = err as {
//         response?: { data?: unknown };
//         message?: string;
//       };
//       const msg =
//         axiosErr.response?.data ?? axiosErr.message ?? "Login failed.";
//       const msgStr = typeof msg === "string" ? msg : "Invalid credentials.";
//       if (msgStr.toLowerCase().includes("email")) setErrors({ email: msgStr });
//       else if (msgStr.toLowerCase().includes("password"))
//         setErrors({ password: msgStr });
//       else if (msgStr.toLowerCase().includes("device"))
//         toast.error("Account linked to a different device.");
//       else if (msgStr.toLowerCase().includes("suspended"))
//         toast.error("Account suspended. Contact support.");
//       else toast.error(msgStr);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <SafeAreaView style={styles.safe}>
//       <KeyboardAvoidingView
//         style={styles.kav}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scroll}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           <View style={styles.header}>
//             <Text style={styles.title}>Welcome back.</Text>
//             <Text style={styles.subtitle}>Sign in to your account</Text>
//           </View>

//           <View style={styles.form}>
//             <FormInput
//               label="Email"
//               placeholder="you@example.com"
//               keyboardType="email-address"
//               autoComplete="email"
//               value={form.email}
//               onChangeText={set("email")}
//               error={errors.email}
//             />
//             <FormInput
//               label="Password"
//               placeholder="••••••••"
//               secureTextEntry={!showPass}
//               autoComplete="password"
//               value={form.password}
//               onChangeText={set("password")}
//               error={errors.password}
//               rightIcon={showPass ? "🙈" : "👁️"}
//               onRightIconPress={(): void => setShowPass((v) => !v)}
//             />

//             <View style={styles.row}>
//               <TouchableOpacity
//                 style={styles.rememberRow}
//                 onPress={(): void => setRemember((v) => !v)}
//                 activeOpacity={0.7}
//               >
//                 <View
//                   style={[styles.checkbox, rememberMe && styles.checkboxActive]}
//                 >
//                   {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
//                 </View>
//                 <Text style={styles.rememberLabel}>Remember me</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={(): void => router.push("/(auth)/forgot-password")}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.forgotLink}>Forgot password?</Text>
//               </TouchableOpacity>
//             </View>

//             <PrimaryButton
//               title="Sign In"
//               onPress={handleLogin}
//               loading={loading}
//               style={styles.btn}
//             />
//           </View>

//           <View style={styles.footer}>
//             <Text style={styles.footerText}>Dont have an account? </Text>
//             <TouchableOpacity
//               onPress={(): void => router.push("/(auth)/register")}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.footerLink}>Create one</Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: COLORS.background },
//   kav: { flex: 1 },
//   scroll: {
//     flexGrow: 1,
//     paddingHorizontal: SPACING.lg,
//     paddingTop: SPACING.xxl,
//     paddingBottom: SPACING.xl,
//   },
//   header: { marginBottom: SPACING.xxl },
//   title: {
//     fontSize: FONT_SIZES.xxl,
//     fontWeight: FONT_WEIGHTS.black,
//     color: COLORS.text,
//     marginBottom: SPACING.xs,
//     letterSpacing: -0.5,
//   },
//   subtitle: { fontSize: FONT_SIZES.base, color: COLORS.textSecondary },
//   form: { flex: 1 },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: SPACING.lg,
//     marginTop: -SPACING.xs,
//   },
//   rememberRow: { flexDirection: "row", alignItems: "center" },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 4,
//     borderWidth: 1.5,
//     borderColor: COLORS.border,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: SPACING.xs,
//   },
//   checkboxActive: {
//     backgroundColor: COLORS.accent,
//     borderColor: COLORS.accent,
//   },
//   checkmark: {
//     color: COLORS.white,
//     fontSize: 12,
//     fontWeight: FONT_WEIGHTS.bold,
//   },
//   rememberLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
//   forgotLink: {
//     fontSize: FONT_SIZES.sm,
//     color: COLORS.accent,
//     fontWeight: FONT_WEIGHTS.medium,
//   },
//   btn: { marginTop: SPACING.xs },
//   footer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: SPACING.xl,
//   },
//   footerText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
//   footerLink: {
//     fontSize: FONT_SIZES.sm,
//     color: COLORS.accent,
//     fontWeight: FONT_WEIGHTS.semibold,
//   },
// });
