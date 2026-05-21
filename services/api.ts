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
  const message =
    typeof data === "string"
      ? data
      : (data as { message?: string } | null)?.message ?? err.message;

  return new ApiError({ code: statusToCode(status), status, data, message });
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
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
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
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    return Promise.reject(normalize(error));
  },
);

export default api;
