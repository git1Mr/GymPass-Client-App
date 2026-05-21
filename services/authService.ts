import { AxiosResponse } from "axios";
import * as SecureStore from "expo-secure-store";
import api, { ApiError, ApiErrorCode, REMEMBER_KEY, TOKEN_KEY } from "./api";

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

export type AuthErrorCode =
  | "EMAIL_NOT_FOUND"
  | "WRONG_PASSWORD"
  | "INVALID_CREDENTIALS"
  | "EMAIL_TAKEN"
  | "DEVICE_MISMATCH"
  | "ACCOUNT_SUSPENDED"
  | "MISSING_TOKEN"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

export class AuthError extends ApiError {
  readonly authCode: AuthErrorCode;

  constructor(opts: {
    authCode: AuthErrorCode;
    code: ApiErrorCode;
    message: string;
    status?: number;
    data?: unknown;
  }) {
    super(opts);
    this.name = "AuthError";
    this.authCode = opts.authCode;
  }
}

type AuthIntent = "login" | "register" | "forgot" | "reset";

function rawLower(data: unknown): string {
  if (typeof data === "string") return data.toLowerCase();
  if (data && typeof data === "object" && "message" in data) {
    const m = (data as { message?: unknown }).message;
    return typeof m === "string" ? m.toLowerCase() : "";
  }
  return "";
}

function mk(
  authCode: AuthErrorCode,
  message: string,
  src: ApiError,
): AuthError {
  return new AuthError({
    authCode,
    code: src.code,
    status: src.status,
    data: src.data,
    message,
  });
}

function classifyAuth(err: unknown, intent: AuthIntent): AuthError {
  if (!(err instanceof ApiError)) {
    return new AuthError({
      authCode: "UNKNOWN",
      code: "UNKNOWN",
      message: err instanceof Error ? err.message : "Unexpected error.",
    });
  }

  if (err.code === "NETWORK_ERROR")
    return mk("NETWORK_ERROR", err.message, err);
  if (err.code === "TIMEOUT") return mk("TIMEOUT", err.message, err);

  const raw = rawLower(err.data);

  if (err.status === 400 && intent === "login") {
    if (raw.includes("email"))
      return mk("EMAIL_NOT_FOUND", "No account found with this email.", err);
    if (raw.includes("password") || raw.includes("invalid"))
      return mk("WRONG_PASSWORD", "Incorrect password. Please try again.", err);
    return mk("INVALID_CREDENTIALS", "Invalid credentials.", err);
  }

  if ((err.status === 400 || err.status === 409) && intent === "register") {
    if (raw.includes("email") || raw.includes("already"))
      return mk(
        "EMAIL_TAKEN",
        "An account with this email already exists.",
        err,
      );
    if (raw.includes("device"))
      return mk(
        "DEVICE_MISMATCH",
        "This device is already linked to another account.",
        err,
      );
  }

  if (err.status === 403) {
    if (raw.includes("device"))
      return mk(
        "DEVICE_MISMATCH",
        "This account is linked to a different device.",
        err,
      );
    if (raw.includes("suspended"))
      return mk(
        "ACCOUNT_SUSPENDED",
        "Your account has been suspended. Contact support.",
        err,
      );
  }

  const fallback = typeof err.data === "string" ? err.data : err.message;
  return mk("UNKNOWN", fallback, err);
}

function extractToken<T extends AuthResponse>(
  response: AxiosResponse<T>,
): string | undefined {
  const header = response.headers["x-auth-token"];
  if (typeof header === "string" && header.length > 0) return header;
  return response.data?.token;
}

async function persistRememberedEmail(
  email: string,
  remember: boolean,
): Promise<void> {
  if (remember) await SecureStore.setItemAsync(REMEMBER_KEY, email);
  else await SecureStore.deleteItemAsync(REMEMBER_KEY);
}

export async function login(params: LoginParams): Promise<AuthResponse> {
  const { email, password, deviceId, rememberMe = false } = params;
  try {
    const response = await api.post<AuthResponse>("/auth", {
      email,
      password,
      deviceId,
    });

    const token = extractToken(response);
    if (!token) {
      throw new AuthError({
        authCode: "MISSING_TOKEN",
        code: "UNKNOWN",
        message: "No token returned from server.",
      });
    }

    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await persistRememberedEmail(email, rememberMe);

    return { ...response.data, token };
  } catch (err) {
    throw classifyAuth(err, "login");
  }
}

export async function register(params: RegisterParams): Promise<AuthResponse> {
  const { name, email, password, deviceId } = params;
  try {
    const response = await api.post<AuthResponse>("/users", {
      // backend's Joi schema uses `name`, not `fullName`
      name,
      email,
      password,
      deviceId,
      role: "member",
    });

    const token = extractToken(response);
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);

    return token ? { ...response.data, token } : response.data;
  } catch (err) {
    throw classifyAuth(err, "register");
  }
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export interface ForgotPasswordResponse {
  message: string;
  // Demo build returns the token inline; production delivers it by email.
  resetToken?: string;
  expiresAt?: string;
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
  } catch (err) {
    throw classifyAuth(err, "forgot");
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
  } catch (err) {
    throw classifyAuth(err, "reset");
  }
}

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getRememberedEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(REMEMBER_KEY);
}
