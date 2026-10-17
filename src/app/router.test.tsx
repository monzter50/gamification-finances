import { QueryClientProvider } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { AuthProvider } from "@/app/providers/AuthProvider";
import { createQueryClient } from "@/app/query-client";
import { routes } from "@/app/router";
import { saveSession } from "@/features/auth";
import { ThemeProvider } from "@/shared/theme";
import { api, server } from "@/test/server";

/** The real route table + providers, in memory, starting at `url`. */
const renderApp = (url: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  render(
    <QueryClientProvider client={createQueryClient()}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
  return router;
};

const signIn = () => {
  saveSession("stored-token", 3600);
  server.use(
    http.get(api("/auth/me"), () =>
      HttpResponse.json({ success: true, id: "u1", email: "ana@example.com", name: "Ana" }),
    ),
    http.get(api("/accounts"), () => HttpResponse.json({ success: true, data: [] })),
  );
};

describe("router", () => {
  it("sends a signed-out visitor to the (lazy) login page", async () => {
    const router = renderApp("/accounts");

    expect(await screen.findByRole("button", { name: "Log in" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
  });

  it("renders a lazy page inside the layout for a signed-in user", async () => {
    signIn();
    renderApp("/accounts");

    expect(await screen.findByRole("heading", { name: "Accounts" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
  });

  it("marks the current page in the sidebar; Dashboard links to the index route", async () => {
    signIn();
    renderApp("/accounts");

    const nav = await screen.findByRole("navigation", { name: "Main" });
    const accounts = await screen.findByRole("link", { name: "Accounts" });
    const dashboard = screen.getByRole("link", { name: "Dashboard" });

    expect(nav).toContainElement(accounts);
    expect(accounts).toHaveAttribute("aria-current", "page");
    expect(dashboard).toHaveAttribute("href", "/");
    expect(dashboard).not.toHaveAttribute("aria-current");
  });

  it("redirects unknown URLs home (then to login when signed out)", async () => {
    const router = renderApp("/does-not-exist");

    expect(await screen.findByRole("button", { name: "Log in" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
  });
});
