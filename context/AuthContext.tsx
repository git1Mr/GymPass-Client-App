// app/context/AuthContext.js
// Fix: on auto-login (stored token), we now decode the JWT payload
// to extract _id, role, gymId and populate the user object immediately
// — no extra network call required.
// This fixes AccessAnyGym (and any component) that guards on `user` being non-null.

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import {
    getStoredToken,
    login,
    logout,
    register,
} from "../services/authService";

const AuthContext = createContext(null);

// ── JWT decoder (no library needed — just base64 the payload) ─────────────
// We are NOT verifying the signature here — that is the backend's job.
// We only read the payload to know who the user is for UI purposes.
function decodeJwtPayload(token) {
  try {
    const base64Payload = token.split(".")[1];
    // React Native's atob can be unreliable — use Buffer-style decode instead
    const decoded = decodeURIComponent(
      atob(base64Payload)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);

  // On mount: restore token + decode user from it
  useEffect(() => {
    (async () => {
      try {
        const stored = await getStoredToken();
        if (stored) {
          setToken(stored);
          // Decode payload → gives us { _id, role, gymId, isAdmin }
          const payload = decodeJwtPayload(stored);
          if (payload) {
            setUser({
              _id: payload._id,
              role: payload.role,
              gymId: payload.gymId ?? null,
              isAdmin: payload.isAdmin ?? false,
              // Attempt to hydrate full profile in background (optional)
              name: null,
              email: null,
              pointsBalance: 0,
            });

            // Background fetch: silently enrich user object with live data.
            // If this fails (offline / expired token) the decoded data above
            // is still enough for AccessAnyGym and role-gating to work.
            api
              .get("/users/me")
              .then((res) => setUser(res.data))
              .catch(() => {
                /* stay with decoded payload */
              });
          }
        }
      } catch {
        // SecureStore failure — proceed as logged-out
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function signIn(credentials) {
    const data = await login(credentials);
    const incoming = data.token;
    if (incoming) {
      setToken(incoming);
      // Try to use a full user object returned by the API; fall back to decode
      setUser(data.user ?? decodeJwtPayload(incoming));
    }
    return data;
  }

  async function signUp(fields) {
    const data = await register(fields);
    const incoming = data.token;
    if (incoming) {
      setToken(incoming);
      setUser(data.user ?? decodeJwtPayload(incoming));
    }
    return data;
  }

  async function signOut() {
    await logout();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, user, isLoading, signIn, signOut, signUp }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// // context/AuthContext.tsx
// //
// // Single source of truth for auth state.
// // Key guarantees:
// //   • isLoading stays true until SecureStore has been read on mount.
// //   • setToken is called BEFORE returning from signIn/signUp so the
// //     reactive useEffect in AuthGate fires with the new value immediately.
// //   • signOut clears storage first, then nulls the token — AuthGate
// //     reacts and calls router.replace('/(auth)/login') automatically.

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
//     useCallback,
//     useContext,
//     useEffect,
//     useState,
// } from "react";

// // ── Context shape ─────────────────────────────────────────────────────────────

// interface AuthContextValue {
//   /** Raw JWT string or null when logged-out. */
//   token: string | null;
//   /** Decoded user object, populated after sign-in. */
//   user: AuthUser | null;
//   /** True while SecureStore is being read on app launch. */
//   isLoading: boolean;
//   /** Convenience boolean — avoids null-checks in guards. */
//   isAuthenticated: boolean;
//   signIn: (credentials: LoginParams) => Promise<AuthResponse>;
//   signUp: (fields: RegisterParams) => Promise<AuthResponse>;
//   /** Clears SecureStore + nulls state. AuthGate reacts automatically. */
//   signOut: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextValue | null>(null);

// // ── Provider ──────────────────────────────────────────────────────────────────

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
//   const [token, setToken] = useState<string | null>(null);
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [isLoading, setLoading] = useState<boolean>(true);

//   // ── Boot: read stored token once ───────────────────────────────────────────
//   useEffect((): void => {
//     (async (): Promise<void> => {
//       try {
//         const stored: string | null = await getStoredToken();
//         if (stored) setToken(stored);
//       } catch {
//         // Storage unavailable — treat as logged-out
//       } finally {
//         // Always resolve loading so the gate can make a routing decision
//         setLoading(false);
//       }
//     })();
//   }, []);

//   // ── signIn ─────────────────────────────────────────────────────────────────
//   const signIn = useCallback(
//     async (credentials: LoginParams): Promise<AuthResponse> => {
//       // authService writes the token to SecureStore before returning
//       const data: AuthResponse = await login(credentials);
//       // Update state AFTER storage write so both are always in sync
//       setToken(data.token ?? null);
//       setUser(data.user ?? null);
//       return data;
//     },
//     [],
//   );

//   // ── signUp ─────────────────────────────────────────────────────────────────
//   const signUp = useCallback(
//     async (fields: RegisterParams): Promise<AuthResponse> => {
//       const data: AuthResponse = await register(fields);
//       if (data.token) setToken(data.token);
//       setUser(data.user ?? null);
//       return data;
//     },
//     [],
//   );

//   // ── signOut ────────────────────────────────────────────────────────────────
//   // Clears storage first, THEN nulls React state.
//   // The token → null change triggers AuthGate's useEffect → router.replace.
//   const signOut = useCallback(async (): Promise<void> => {
//     await logout(); // deletes from SecureStore / localStorage
//     setUser(null);
//     setToken(null); // ← this is what the AuthGate watches
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         token,
//         user,
//         isLoading,
//         isAuthenticated: token !== null,
//         signIn,
//         signUp,
//         signOut,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // ── Hook ──────────────────────────────────────────────────────────────────────

// export function useAuth(): AuthContextValue {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
//   return ctx;
// }
