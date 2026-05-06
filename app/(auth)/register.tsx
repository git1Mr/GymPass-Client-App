// app/(auth)/register.tsx
//
// On success: authService stores JWT → context.setToken fires →
// AuthGate redirects to /(tabs) via replace. No manual navigation needed.

import * as Device from "expo-device";
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

import FormInput from "@/components/ui/FormInput";
import PrimaryButton from "@/components/ui/PrimaryButton";
import toast from "@/components/ui/Toast";
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { registerSchema, validate } from "@/validation/authSchema";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Maps raw backend response strings to user-facing errors.
// Keep in sync with gympass/routes/users.js.
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

  if (status === 400) {
    if (
      rawStr.includes("email already") ||
      rawStr.includes("already registered")
    )
      return {
        field: "email",
        message: "An account with this email already exists.",
      };
    if (rawStr.includes("device"))
      return { message: "This device is already linked to another account." };
    if (typeof raw === "string") return { message: raw };
  }

  const fallback =
    axiosErr.message ?? "Could not connect to the server. Check your network.";
  return { message: fallback };
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function RegisterScreen(): JSX.Element {
  const { signUp } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPass, setShowPass] = useState<boolean>(false);
  const [showConf, setShowConf] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  function setField(field: keyof RegisterForm) {
    return (value: string): void => {
      setForm((f) => ({ ...f, [field]: value }));
      if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    };
  }

  async function handleRegister(): Promise<void> {
    // 1. Client-side Joi validation
    const clientErrors = validate(
      registerSchema,
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

      // 2. Call backend — on success, context sets token → AuthGate redirects
      await signUp({
        ...form,
        deviceId,
      });

      // 3. Show a brief welcome toast (it will still show on the home screen)
      toast.success("Welcome to GymPass! 🏋️");
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
            <TouchableOpacity
              onPress={(): void => router.back()}
              style={styles.backBtn}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Create account.</Text>
            <Text style={styles.subtitle}>Join the GymPass network</Text>
          </View>

          {/* ── Form ── */}
          <View style={styles.form}>
            <FormInput
              label="Full Name"
              placeholder="Full Name"
              autoCapitalize="words"
              autoComplete="name"
              value={form.name}
              onChangeText={setField("name")}
              error={errors.name}
            />

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
              placeholder="Min. 8 characters"
              secureTextEntry={!showPass}
              autoComplete="new-password"
              value={form.password}
              onChangeText={setField("password")}
              error={errors.password}
              rightIcon={showPass ? "🙈" : "👁️"}
              onRightIconPress={(): void => setShowPass((v) => !v)}
            />

            <FormInput
              label="Confirm Password"
              placeholder="Repeat your password"
              secureTextEntry={!showConf}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChangeText={setField("confirmPassword")}
              error={errors.confirmPassword}
              rightIcon={showConf ? "🙈" : "👁️"}
              onRightIconPress={(): void => setShowConf((v) => !v)}
            />

            <PrimaryButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              style={styles.btn}
            />
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={(): void => router.push("/(auth)/login")}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Sign in</Text>
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  header: { marginBottom: SPACING.xl },
  backBtn: { marginBottom: SPACING.md, alignSelf: "flex-start" },
  backArrow: { fontSize: FONT_SIZES.xl, color: COLORS.textSecondary },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: FONT_SIZES.base, color: COLORS.textSecondary },
  form: { flex: 1 },
  btn: { marginTop: SPACING.sm },
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

// app/(auth)/register.tsx

// import * as Device from "expo-device";
// import { useRouter } from "expo-router";
// import React, { JSX, useState } from "react";
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
// import { registerSchema, validate } from "@/validation/authSchema";
// import {
//     COLORS,
//     FONT_SIZES,
//     FONT_WEIGHTS,
//     SPACING,
// } from "../../constants/theme";

// interface RegisterForm {
//   FullName: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
// }
// interface FormErrors {
//   fullName?: string;
//   email?: string;
//   password?: string;
//   confirmPassword?: string;
// }

// export default function RegisterScreen(): JSX.Element {
//   const { signUp } = useAuth();
//   const router = useRouter();

//   const [form, setForm] = useState<RegisterForm>({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [showPass, setShowPass] = useState<boolean>(false);
//   const [showConf, setShowConf] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);

//   function set(field: keyof RegisterForm) {
//     return (value: string): void => {
//       setForm((f) => ({ ...f, [field]: value }));
//       if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
//     };
//   }

//   async function handleRegister(): Promise<void> {
//     const errs = validate(
//       registerSchema,
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
//       await signUp({ ...form, deviceId });
//       toast.success("Account created! Welcome to GymPass.");
//     } catch (err: unknown) {
//       const axiosErr = err as {
//         response?: { data?: unknown };
//         message?: string;
//       };
//       const msg =
//         axiosErr.response?.data ?? axiosErr.message ?? "Registration failed.";
//       const msgStr = typeof msg === "string" ? msg : "Something went wrong.";
//       if (msgStr.toLowerCase().includes("email"))
//         setErrors({ email: "This email is already registered." });
//       else if (msgStr.toLowerCase().includes("device"))
//         toast.error("This device is already linked to another account.");
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
//             <TouchableOpacity
//               onPress={(): void => router.back()}
//               style={styles.backBtn}
//             >
//               <Text style={styles.backArrow}>←</Text>
//             </TouchableOpacity>
//             <Text style={styles.title}>Create account.</Text>
//             <Text style={styles.subtitle}>Join the GymPass network</Text>
//           </View>

//           <View style={styles.form}>
//             <FormInput
//               label="Full Name"
//               placeholder="Zakaria Lembarki"
//               autoCapitalize="words"
//               autoComplete="name"
//               value={form.fullName}
//               onChangeText={set("fullName")}
//               error={errors.fullName}
//             />
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
//               placeholder="Min. 8 characters"
//               secureTextEntry={!showPass}
//               autoComplete="new-password"
//               value={form.password}
//               onChangeText={set("password")}
//               error={errors.password}
//               rightIcon={showPass ? "🙈" : "👁️"}
//               onRightIconPress={(): void => setShowPass((v) => !v)}
//             />
//             <FormInput
//               label="Confirm Password"
//               placeholder="Repeat your password"
//               secureTextEntry={!showConf}
//               autoComplete="new-password"
//               value={form.confirmPassword}
//               onChangeText={set("confirmPassword")}
//               error={errors.confirmPassword}
//               rightIcon={showConf ? "🙈" : "👁️"}
//               onRightIconPress={(): void => setShowConf((v) => !v)}
//             />
//             <PrimaryButton
//               title="Create Account"
//               onPress={handleRegister}
//               loading={loading}
//               style={styles.btn}
//             />
//           </View>

//           <View style={styles.footer}>
//             <Text style={styles.footerText}>Already have an account? </Text>
//             <TouchableOpacity
//               onPress={(): void => router.push("/(auth)/login")}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.footerLink}>Sign in</Text>
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
//     paddingTop: SPACING.xl,
//     paddingBottom: SPACING.xl,
//   },
//   header: { marginBottom: SPACING.xl },
//   backBtn: { marginBottom: SPACING.md, alignSelf: "flex-start" },
//   backArrow: { fontSize: FONT_SIZES.xl, color: COLORS.textSecondary },
//   title: {
//     fontSize: FONT_SIZES.xxl,
//     fontWeight: FONT_WEIGHTS.black,
//     color: COLORS.text,
//     marginBottom: SPACING.xs,
//     letterSpacing: -0.5,
//   },
//   subtitle: { fontSize: FONT_SIZES.base, color: COLORS.textSecondary },
//   form: { flex: 1 },
//   btn: { marginTop: SPACING.sm },
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
