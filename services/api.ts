import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export const TOKEN_KEY = "unityfitness_jwt" as const;
export const REMEMBER_KEY = "unityfitness_remember_email" as const;

function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv;

  if (__DEV__) {
    // Android emulator routes the host as 10.0.2.2; iOS sim can use localhost.
    // Physical devices need a LAN IP — set EXPO_PUBLIC_API_URL in .env instead.
    const devHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
    const fallback = `http://${devHost}:8080/api`;
    console.warn(
      `[api] EXPO_PUBLIC_API_URL missing — using dev fallback ${fallback}. ` +
        "Set it in .env and restart with `npx expo start -c`.",
    );
    return fallback;
  }

  throw new Error("EXPO_PUBLIC_API_URL must be defined for production builds.");
}

export const BASE_URL: string = resolveBaseUrl();

export type ApiErrorCode =
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVER_ERROR"
  | "UNKNOWN";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly data?: unknown;

  constructor(opts: {
    code: ApiErrorCode;
    message: string;
    status?: number;
    data?: unknown;
  }) {
    super(opts.message);
    this.name = "ApiError";
    this.code = opts.code;
    this.status = opts.status;
    this.data = opts.data;
  }

  // Axios-compatible shape so existing call sites that read `err.response?.data`
  // keep working without changes.
  get response(): { status?: number; data?: unknown } | undefined {
    if (this.status === undefined && this.data === undefined) return undefined;
    return { status: this.status, data: this.data };
  }
}

function statusToCode(status: number): ApiErrorCode {
  if (status === 400) return "BAD_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status >= 500) return "SERVER_ERROR";
  return "UNKNOWN";
}

function normalize(err: AxiosError): ApiError {
  if (err.code === "ECONNABORTED") {
    return new ApiError({
      code: "TIMEOUT",
      message: "Request timed out. Check your connection.",
    });
  }
  if (!err.response) {
    return new ApiError({
      code: "NETWORK_ERROR",
      message: "Could not reach the server. Check your network.",
    });
  }

  const { status, data } = err.response;
  // Proxies (ngrok, nginx) answer with full HTML error pages — never surface
  // raw markup to the UI.
  const looksLikeHtml = typeof data === "string" && /^\s*</.test(data);
  const message = looksLikeHtml
    ? status >= 500
      ? "The server is unreachable right now. Please try again shortly."
      : err.message
    : typeof data === "string"
      ? data
      : (data as { message?: string } | null)?.message ?? err.message;

  return new ApiError({ code: statusToCode(status), status, data, message });
}

// In-memory token register. Used for "session-only" logins where the token must
// NOT survive a cold start (rememberMe=false). When set, takes precedence over
// the persistent SecureStore value for outgoing requests.
let inMemoryToken: string | null = null;
export function setApiToken(token: string | null): void {
  inMemoryToken = token;
}

// AuthContext subscribes here so a 401 from the server can clear in-memory auth
// state — otherwise the interceptor only deletes the SecureStore copy and the
// app keeps routing as if logged in.
type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    const token = inMemoryToken ?? (await SecureStore.getItemAsync(TOKEN_KEY));
    if (token && config.headers) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      inMemoryToken = null;
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      unauthorizedHandler?.();
    }
    return Promise.reject(normalize(error));
  },
);

export default api;
