// Re-export the useTheme hook for easier imports
export { useTheme } from "@/context/ThemeContext";

// Additional theme-related utilities
export const getSystemTheme = (): "light" | "dark" => {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
};

export const isSystemDarkMode = (): boolean => {
  return getSystemTheme() === "dark";
}; 