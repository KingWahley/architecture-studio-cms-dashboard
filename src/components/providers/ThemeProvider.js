"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "dashboard-theme";
const DEFAULT_THEME = "gold";

const ThemeContext = createContext(null);

const THEMES = {
  light: {
    id: "light",
    label: "Light",
    description: "Bright, neutral workspace for daytime editing.",
  },
  dark: {
    id: "dark",
    label: "Dark",
    description: "Low-glare interface for focused, late-night work.",
  },
  gold: {
    id: "gold",
    label: "Gold",
    description: "Brand-led studio theme with warm gold highlights.",
  },
};

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function getInitialTheme() {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  return savedTheme && THEMES[savedTheme] ? savedTheme : DEFAULT_THEME;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: Object.values(THEMES),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return context;
}
