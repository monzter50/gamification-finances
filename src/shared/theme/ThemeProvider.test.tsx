import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ThemeProvider, ThemeToggle } from "@/shared/theme";

describe("ThemeProvider", () => {
  it("applies the default theme to <html> when nothing is stored", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeToggle />
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement).not.toHaveClass("light");
  });

  it("toggles the <html> class and remembers the choice", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }));

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement).not.toHaveClass("light");
    expect(JSON.parse(localStorage.getItem("theme") ?? "null")).toBe("dark");
  });

  it("prefers a stored choice over the default", () => {
    localStorage.setItem("theme", JSON.stringify("light"));
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeToggle />
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveClass("light");
  });
});
