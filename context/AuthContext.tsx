import api, {
    setApiToken,
    setUnauthorizedHandler,
    TOKEN_KEY,
} from "@/services/api";
import {
    AuthResponse,
    AuthUser,
    getStoredToken,
    login,
    LoginParams,
    logout,
    register,
    RegisterParams,
} from "@/services/authService";
import * as SecureStore from "expo-secure-store";
import React, {
    createContext,
    JSX,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

export interface AppUser extends AuthUser {
  gymId?: string | null;
  isAdmin?: boolean;
}

interface AuthContextValue {
  token: string | null;
  user: AppUser | null;
  isLoading: boolean;
  signIn: (credentials: LoginParams) => Promise<AuthResponse>;
  signUp: (fields: RegisterParams) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  // Re-fetch /users/me to pick up server-side changes (e.g. pointsBalance after a webhook).
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Decodes JWT payload without verifying — UI display only. Verification is the backend's job.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Payload = token.split(".")[1];
    const decoded = decodeURIComponent(
      atob(base64Payload)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// `exp` is a Unix timestamp in seconds per RFC 7519. We treat a missing or past
// exp as expired so the app routes back to login instead of trusting a stale
// token forever.
function isJwtExpired(payload: Record<string, unknown> | null): boolean {
  if (!payload) return true;
  const exp = payload.exp;
  if (typeof exp !== "number") return true;
  return exp * 1000 <= Date.now();
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Wire up the global 401 handler so a server-side rejection clears the
    // in-memory token state too, not just the SecureStore copy.
    setUnauthorizedHandler(() => {
      setApiToken(null);
      setToken(null);
      setUser(null);
    });

    (async (): Promise<void> => {
      try {
        const stored = await getStoredToken();
        if (!stored) return;

        const payload = decodeJwtPayload(stored);
        if (!payload || isJwtExpired(payload)) {
          // Expired/malformed token — discard so the gate routes to login.
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          setApiToken(null);
          return;
        }

        setApiToken(stored);
        setToken(stored);
        setUser({
          _id: payload._id as string,
          name: (payload.name as string | undefined) ?? "",
          email: (payload.email as string | undefined) ?? "",
          role: payload.role as AuthUser["role"],
          pointsBalance: (payload.pointsBalance as number | undefined) ?? 0,
          gymId: (payload.gymId as string | undefined) ?? null,
          isAdmin: (payload.isAdmin as boolean | undefined) ?? false,
        });
        // Best-effort refresh of profile fields. A 401 here is handled by the
        // response interceptor → unauthorizedHandler above; network errors are
        // intentionally swallowed so offline users stay signed in.
        api
          .get("/users/me")
          .then((res) => setUser(res.data as AppUser))
          .catch(() => {});
      } catch {
        // SecureStore unavailable — treat as logged-out
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  async function signIn(credentials: LoginParams): Promise<AuthResponse> {
    const data = await login(credentials);
    if (data.token) {
      setToken(data.token);
      if (data.user) {
        setUser(data.user as AppUser);
      } else {
        api
          .get("/users/me")
          .then((res) => setUser(res.data as AppUser))
          .catch(() => {});
      }
    }
    return data;
  }

  async function signUp(fields: RegisterParams): Promise<AuthResponse> {
    const data = await register(fields);
    if (data.token) {
      setToken(data.token);
      if (data.user) {
        setUser(data.user as AppUser);
      } else {
        api
          .get("/users/me")
          .then((res) => setUser(res.data as AppUser))
          .catch(() => {});
      }
    }
    return data;
  }

  async function signOut(): Promise<void> {
    await logout();
    setToken(null);
    setUser(null);
  }

  async function refreshUser(): Promise<void> {
    try {
      const res = await api.get("/users/me");
      setUser(res.data as AppUser);
    } catch {
      // 401 is handled globally by the response interceptor.
    }
  }

  return (
    <AuthContext.Provider
      value={{ token, user, isLoading, signIn, signUp, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
