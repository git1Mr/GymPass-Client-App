import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import { darkPalette, lightPalette, Palette } from "./palette";

export type ThemeMode = "auto" | "light" | "dark";
export type EffectiveMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  effective: EffectiveMode;
  colors: Palette;
  isDark: boolean;
  setMode: (m: ThemeMode) => Promise<void>;
  isHydrated: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "uf.theme.mode";

function resolveEffective(mode: ThemeMode, system: EffectiveMode): EffectiveMode {
  return mode === "auto" ? system : mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system: EffectiveMode = (useColorScheme() ?? "light") as EffectiveMode;
  const [mode, setModeState] = useState<ThemeMode>("auto");
  const [isHydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(STORAGE_KEY);
        if (saved === "auto" || saved === "light" || saved === "dark") {
          setModeState(saved);
        }
      } catch {
        // SecureStore unavailable — stay on "auto"
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, next);
    } catch {
      // Non-fatal — preference still applies in-memory for this session
    }
  }, []);

  const effective = resolveEffective(mode, system);
  const colors = effective === "dark" ? darkPalette : lightPalette;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      effective,
      colors,
      isDark: effective === "dark",
      setMode,
      isHydrated,
    }),
    [mode, effective, colors, setMode, isHydrated],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
