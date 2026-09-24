import { Toaster } from "sonner";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Accent, Appearance, Density, ThemeMode } from "@/lib/types";

const STORAGE = {
  theme: "tronx-theme",
  accent: "tronx-accent",
  density: "tronx-density",
};

function readStored(): Appearance {
  if (typeof window === "undefined") {
    return { theme: "dark", accent: "teal", density: "comfortable" };
  }
  try {
    const theme = (localStorage.getItem(STORAGE.theme) as ThemeMode) || "dark";
    const accent = (localStorage.getItem(STORAGE.accent) as Accent) || "teal";
    const density = (localStorage.getItem(STORAGE.density) as Density) || "comfortable";
    return {
      theme: ["light", "dark", "system"].includes(theme) ? theme : "dark",
      accent: ["teal", "ink", "dusk", "sand"].includes(accent) ? accent : "teal",
      density: density === "compact" ? "compact" : "comfortable",
    };
  } catch {
    return { theme: "dark", accent: "teal", density: "comfortable" };
  }
}

function resolvedMode(theme: ThemeMode): "light" | "dark" {
  if (theme === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme === "light" ? "light" : "dark";
}

export function applyAppearance(next: Appearance) {
  if (typeof document === "undefined") return;
  const mode = resolvedMode(next.theme);
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.dataset.theme = mode;
  document.documentElement.dataset.accent = next.accent;
  document.documentElement.dataset.density = next.density;
  try {
    localStorage.setItem(STORAGE.theme, next.theme);
    localStorage.setItem(STORAGE.accent, next.accent);
    localStorage.setItem(STORAGE.density, next.density);
  } catch {
    /* ignore */
  }
}

export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("tronx-theme")||"dark";var a=localStorage.getItem("tronx-accent")||"teal";var d=localStorage.getItem("tronx-density")||"comfortable";var mode=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):(t==="light"?"light":"dark");document.documentElement.classList.toggle("dark",mode==="dark");document.documentElement.dataset.theme=mode;document.documentElement.dataset.accent=a;document.documentElement.dataset.density=d;}catch(e){document.documentElement.classList.add("dark");}})();`;

type ThemeCtx = Appearance & {
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: Accent) => void;
  setDensity: (density: Density) => void;
  hydrate: (next: Appearance) => void;
  resolved: "light" | "dark";
};

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({
  children,
  initial,
  onPersist,
}: {
  children: ReactNode;
  initial?: Partial<Appearance>;
  onPersist?: (next: Appearance) => void;
}) {
  const [value, setValue] = useState<Appearance>(() => ({ ...readStored(), ...initial }));
  const resolved = resolvedMode(value.theme);

  useEffect(() => {
    applyAppearance(value);
  }, [value]);

  useEffect(() => {
    if (value.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyAppearance(value);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [value]);

  const api = useMemo<ThemeCtx>(
    () => ({
      ...value,
      resolved,
      setTheme: (theme) => {
        setValue((v) => {
          const next = { ...v, theme };
          onPersist?.(next);
          return next;
        });
      },
      setAccent: (accent) => {
        setValue((v) => {
          const next = { ...v, accent };
          onPersist?.(next);
          return next;
        });
      },
      setDensity: (density) => {
        setValue((v) => {
          const next = { ...v, density };
          onPersist?.(next);
          return next;
        });
      },
      hydrate: (next) => {
        setValue(next);
      },
    }),
    [value, resolved, onPersist],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme requires ThemeProvider");
  return ctx;
}

export function useThemeOptional() {
  return useContext(Ctx);
}

export function ThemedToaster() {
  const theme = useThemeOptional();
  return (
    <Toaster
      theme={theme?.resolved === "light" ? "light" : "dark"}
      position="bottom-right"
      richColors={false}
    />
  );
}
