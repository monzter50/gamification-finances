import { useLocalStorage } from "@aglaya/hooks/useLocalStorage";
import React, { createContext, useContext, useEffect } from "react";

import { themeLogger } from "@/lib/logger";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  // eslint-disable-next-line no-unused-vars
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = "light" }: ThemeProviderProps) {
  // Get initial theme from localStorage with system preference fallback
  const getInitialTheme = (): Theme => {
    if (typeof window !== "undefined") {
      // Check system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        themeLogger.debug("Detected dark system preference");
        return "dark";
      }
    }
    return defaultTheme;
  };

  const [ theme, setThemeState ] = useLocalStorage<Theme>("theme", getInitialTheme());

  const setTheme = (newTheme: Theme) => {
    themeLogger.info(`Theme changed from ${theme} to ${newTheme}`);
    setThemeState(newTheme);

    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    themeLogger.info(`Theme toggled to ${newTheme}`);
    setTheme(newTheme);
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    themeLogger.debug(`Applying theme: ${theme}`);
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [ theme ]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? "dark" : "light";
      themeLogger.info(`System theme changed to ${systemTheme}`);
      // Note: With useLocalStorage, theme will persist, so system changes won't override
      // unless we explicitly want that behavior
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
} 