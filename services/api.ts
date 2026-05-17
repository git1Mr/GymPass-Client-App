import axios, {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";

import * as SecureStore from "expo-secure-store";

// The mobile/web client always talks to the API gateway (nginx on :8080),
// which fans the request out to auth-service, wallet-service, qr-security-service
// or settlement-engine. Override with EXPO_PUBLIC_API_URL for non-localhost
// environments:
//   - Expo web / iOS simulator:    http://localhost:8080/api      (default)
//   - Android emulator:            http://10.0.2.2:8080/api
//   - Expo Go on a physical phone: http://<your-LAN-IP>:8080/api  or your Cloudflare tunnel URL
const BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.11.104:8080/api";

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

//ngrok http --domain=gerbil-lecturer-imagines.ngrok-free.dev 8080
