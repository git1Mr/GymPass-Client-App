import api from "@/services/api";
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
import React, {
    createContext,
    JSX,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

// AppUser extends AuthUser with optional JWT-only fields populated at startup
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
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Decodes JWT payload without verifying the signature — UI purposes only.
// Verification is the backend's responsibility.
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

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect((): void => {
    (async (): Promise<void> => {
      try {
        const stored = await getStoredToken();
        if (stored) {
          setToken(stored);
          const payload = decodeJwtPayload(stored);
          if (payload) {
            setUser({
              _id: payload._id as string,
              name: (payload.name as string | undefined) ?? "",
              email: (payload.email as string | undefined) ?? "",
              role: payload.role as AuthUser["role"],
              pointsBalance: (payload.pointsBalance as number | undefined) ?? 0,
              gymId: (payload.gymId as string | undefined) ?? null,
              isAdmin: (payload.isAdmin as boolean | undefined) ?? false,
            });
            api
              .get("/users/me")
              .then((res) => setUser(res.data as AppUser))
              .catch(() => {});
          }
        }
      } catch {
        // SecureStore unavailable — treat as logged-out
      } finally {
        setLoading(false);
      }
    })();
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

  return (
    <AuthContext.Provider
      value={{ token, user, isLoading, signIn, signUp, signOut }}
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
