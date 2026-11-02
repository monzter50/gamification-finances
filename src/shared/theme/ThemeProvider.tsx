import { useLocalStorage } from "@aglaya/hooks/useLocalStorage";
import { createContext, type ReactNode, useContext, useEffect } from "react";

import { themeLogger } from "@/lib/logger";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  // eslint-disable-next-line no-unused-vars
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const prefersDark = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

interface ThemeProviderProps {
  children: ReactNode;
  /** Used when nothing is stored and the OS doesn't prefer dark. */
  defaultTheme?: Theme;
}

/**
 * Light/dark preference. A stored choice wins; otherwise the OS preference,
 * then `defaultTheme`. Lives in `shared/` (not `app/providers`) because the
 * design system's ThemeToggle and features read it.
 */
export const ThemeProvider = ({ children, defaultTheme = "light" }: ThemeProviderProps) => {
  const [theme, setThemeState] = useLocalStorage<Theme>(
    "theme",
    prefersDark() ? "dark" : defaultTheme,
  );

  // The one place the <html> class is written (Tailwind `darkMode: "class"`).
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const setTheme = (next: Theme) => {
    themeLogger.info(`Theme changed from ${theme} to ${next}`);
    setThemeState(next);
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
