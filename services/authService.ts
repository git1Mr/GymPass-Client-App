import * as SecureStore from "expo-secure-store";
import api, { REMEMBER_KEY, TOKEN_KEY } from "./api";

export interface LoginParams {
  email: string;
  password: string;
  deviceId: string;
  rememberMe?: boolean;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  deviceId: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "member" | "gym_staff" | "admin";
  pointsBalance: number;
}

export interface AuthResponse {
  token?: string;
  user?: AuthUser;
}

export async function login({
  email,
  password,
  deviceId,
  rememberMe = false,
}: LoginParams): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth", {
      email,
      password,
      deviceId,
    });

    const token =
      (response.headers["x-auth-token"] as string | undefined) ??
      response.data.token;

    if (!token) throw new Error("No token returned from server.");

    await SecureStore.setItemAsync(TOKEN_KEY, token);

    if (rememberMe) {
      await SecureStore.setItemAsync(REMEMBER_KEY, email);
    } else {
      await SecureStore.deleteItemAsync(REMEMBER_KEY);
    }

    return response.data;
  } catch (error: any) {
    const message = error.response?.data || error.message || "Login failed";
    console.error("Login Service Error:", message);
    throw new Error(message);
  }
}

export async function register({
  name,
  email,
  password,
  deviceId,
}: RegisterParams): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/users", {
      name, // field name must match the backend Joi schema (name, not fullName)
      email,
      password,
      deviceId,
      role: "member",
    });

    const token =
      (response.headers["x-auth-token"] as string | undefined) ??
      response.data.token;

    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);

    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data || error.message || "Registration failed";
    console.error("Register Service Error:", message);
    throw new Error(message);
  }
}
export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// In production the reset token is delivered by email; in this build the API
// returns it inline so the demo works without SMTP. The UI auto-fills it.
export interface ForgotPasswordResponse {
  message:     string;
  resetToken?: string;   // demo only
  expiresAt?:  string;
}

export async function requestPasswordReset(
  email: string,
): Promise<ForgotPasswordResponse> {
  try {
    const { data } = await api.post<ForgotPasswordResponse>(
      "/auth/forgot-password",
      { email },
    );
    return data;
  } catch (err: any) {
    const msg = err.response?.data || err.message || "Reset request failed";
    throw new Error(typeof msg === "string" ? msg : "Reset request failed");
  }
}

export async function resetPassword(
  resetToken: string,
  newPassword: string,
): Promise<{ message: string }> {
  try {
    const { data } = await api.post<{ message: string }>(
      "/auth/reset-password",
      { resetToken, newPassword },
    );
    return data;
  } catch (err: any) {
    const msg = err.response?.data || err.message || "Reset failed";
    throw new Error(typeof msg === "string" ? msg : "Reset failed");
  }
}

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getRememberedEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(REMEMBER_KEY);
}
