// context/AuthContext.tsx
//
// Single source of truth for auth state.
// Key guarantees:
//   • isLoading stays true until SecureStore has been read on mount.
//   • setToken is called BEFORE returning from signIn/signUp so the
//     reactive useEffect in AuthGate fires with the new value immediately.
//   • signOut clears storage first, then nulls the token — AuthGate
//     reacts and calls router.replace('/(auth)/login') automatically.

import {
    AuthResponse,
    AuthUser,
    LoginParams,
    RegisterParams,
    getStoredToken,
    login,
    logout,
    register,
} from "@/services/authService";
import React, {
    JSX,
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

// ── Context shape ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Raw JWT string or null when logged-out. */
  token: string | null;
  /** Decoded user object, populated after sign-in. */
  user: AuthUser | null;
  /** True while SecureStore is being read on app launch. */
  isLoading: boolean;
  /** Convenience boolean — avoids null-checks in guards. */
  isAuthenticated: boolean;
  signIn: (credentials: LoginParams) => Promise<AuthResponse>;
  signUp: (fields: RegisterParams) => Promise<AuthResponse>;
  /** Clears SecureStore + nulls state. AuthGate reacts automatically. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);

  // ── Boot: read stored token once ───────────────────────────────────────────
  useEffect((): void => {
    (async (): Promise<void> => {
      try {
        const stored: string | null = await getStoredToken();
        if (stored) setToken(stored);
      } catch {
        // Storage unavailable — treat as logged-out
      } finally {
        // Always resolve loading so the gate can make a routing decision
        setLoading(false);
      }
    })();
  }, []);

  // ── signIn ─────────────────────────────────────────────────────────────────
  const signIn = useCallback(
    async (credentials: LoginParams): Promise<AuthResponse> => {
      // authService writes the token to SecureStore before returning
      const data: AuthResponse = await login(credentials);
      // Update state AFTER storage write so both are always in sync
      setToken(data.token ?? null);
      setUser(data.user ?? null);
      return data;
    },
    [],
  );

  // ── signUp ─────────────────────────────────────────────────────────────────
  const signUp = useCallback(
    async (fields: RegisterParams): Promise<AuthResponse> => {
      const data: AuthResponse = await register(fields);
      if (data.token) setToken(data.token);
      setUser(data.user ?? null);
      return data;
    },
    [],
  );

  // ── signOut ────────────────────────────────────────────────────────────────
  // Clears storage first, THEN nulls React state.
  // The token → null change triggers AuthGate's useEffect → router.replace.
  const signOut = useCallback(async (): Promise<void> => {
    await logout(); // deletes from SecureStore / localStorage
    setUser(null);
    setToken(null); // ← this is what the AuthGate watches
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isAuthenticated: token !== null,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// // context/AuthContext.tsx

// import {
//     AuthResponse,
//     AuthUser,
//     LoginParams,
//     RegisterParams,
//     getStoredToken,
//     login,
//     logout,
//     register,
// } from "@/services/authService";
// import React, {
//     JSX,
//     ReactNode,
//     createContext,
//     useContext,
//     useEffect,
//     useState,
// } from "react";

// interface AuthContextValue {
//   token: string | null;
//   user: AuthUser | null;
//   isLoading: boolean;
//   signIn: (credentials: LoginParams) => Promise<AuthResponse>;
//   signUp: (fields: RegisterParams) => Promise<AuthResponse>;
//   signOut: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextValue | null>(null);

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
//   const [token, setToken] = useState<string | null>(null);
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [isLoading, setLoading] = useState<boolean>(true);

//   useEffect((): void => {
//     (async (): Promise<void> => {
//       try {
//         const stored: string | null = await getStoredToken();
//         if (stored) setToken(stored);
//       } catch {
//         // SecureStore unavailable — proceed as logged-out
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   async function signIn(credentials: LoginParams): Promise<AuthResponse> {
//     const data = await login(credentials);
//     setToken(data.token ?? null);
//     setUser(data.user ?? null);
//     return data;
//   }

//   async function signUp(fields: RegisterParams): Promise<AuthResponse> {
//     const data = await register(fields);
//     if (data.token) setToken(data.token);
//     setUser(data.user ?? null);
//     return data;
//   }

//   async function signOut(): Promise<void> {
//     await logout();
//     setToken(null);
//     setUser(null);
//   }

//   return (
//     <AuthContext.Provider
//       value={{ token, user, isLoading, signIn, signOut, signUp }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth(): AuthContextValue {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
//   return ctx;
// }
