"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Load theme from localStorage
    const stored = localStorage.getItem("december-theme") as Theme | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add("dark");
        root.classList.remove("light");
        setResolvedTheme("dark");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
        setResolvedTheme("light");
      }
    };

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    } else {
      applyTheme(theme === "dark");
    }
  }, [theme]);

  const setAndStoreTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("december-theme", newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme: setAndStoreTheme,
  };
}
