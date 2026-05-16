import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ThemeToggle({ 
  variant = "ghost", 
  size = "icon", 
  className = "" 
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={className}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// Alternative version with text labels
export function ThemeToggleWithText({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant={theme === "light" ? "default" : "outline"}
        size="sm"
        onClick={() => setTheme("light")}
        className="flex items-center space-x-1"
      >
        <Sun className="h-3 w-3" />
        <span>Light</span>
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "outline"}
        size="sm"
        onClick={() => setTheme("dark")}
        className="flex items-center space-x-1"
      >
        <Moon className="h-3 w-3" />
        <span>Dark</span>
      </Button>
    </div>
  );
}

// Dropdown version for more advanced use cases
export function ThemeSelector({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as "light" | "dark")}
      className={`
        rounded-md border border-input bg-background px-3 py-2 text-sm 
        ring-offset-background placeholder:text-muted-foreground 
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${className}
      `}
      aria-label="Select theme"
    >
      <option value="light">🌞 Light</option>
      <option value="dark">🌙 Dark</option>
    </select>
  );
} 