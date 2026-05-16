// app/services/api.ts

import axios, {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";

import * as SecureStore from "expo-secure-store";

const BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? "http://10.50.158.95:3000/api";

export const TOKEN_KEY = "unityfitness_jwt" as const;
export const REMEMBER_KEY = "unityfitness_remember_email" as const;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach stored JWT ──────────────────────────────────
api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    const token: string | null = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token && config.headers) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
);

// ── Response interceptor: handle 401 globally ────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<never> => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

export default api;
