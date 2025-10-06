"use client";

import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-surface-secondary hover:bg-surface-tertiary border border-border transition-colors"
        aria-label="Toggle theme"
      >
        <Sun className="w-4 h-4 text-text-secondary" />
      </button>
    );
  }

  const icons = {
    light: <Sun className="w-4 h-4" />,
    dark: <Moon className="w-4 h-4" />,
    system: <Monitor className="w-4 h-4" />,
  };

  const nextTheme = {
    light: "dark" as const,
    dark: "system" as const,
    system: "light" as const,
  };

  return (
    <button
      onClick={() => setTheme(nextTheme[theme])}
      className="p-2 rounded-lg bg-surface-secondary hover:bg-surface-tertiary border border-border transition-all duration-200 hover:scale-105 active:scale-95"
      aria-label={`Switch to ${nextTheme[theme]} theme`}
      title={`Current: ${theme} theme`}
    >
      <div className="text-text-primary">{icons[theme]}</div>
    </button>
  );
}
