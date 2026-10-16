import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProfilePage from "@/pages/main/profile";
import { renderWithProviders } from "@/test/render";
import { api, server } from "@/test/server";
import type { UserProfileData } from "@/types/api";

const ana: UserProfileData = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana",
  level: 3,
  experience: 420,
  coins: 50,
  totalSavings: 2500,
  totalExpenses: 900,
  savingsGoal: 10000,
  isActive: true,
  lastLogin: "",
  createdAt: "",
  updatedAt: "2026-05-01T00:00:00Z",
};

/** Profile backend: /users/stats 404s like the real one today. */
const serveProfile = (initial = ana) => {
  const state = { profile: initial, profileGets: 0 };
  server.use(
    http.get(api("/auth/me"), () => HttpResponse.json({ success: true, ...state.profile })),
    http.get(api("/users/profile"), () => {
      state.profileGets++;
      return HttpResponse.json({ success: true, data: state.profile });
    }),
    http.get(api("/users/stats"), () =>
      HttpResponse.json({ success: false, message: "Not found" }, { status: 404 }),
    ),
  );
  return state;
};

const renderPage = () =>
  renderWithProviders(
    <ThemeProvider>
      <AuthProvider>
        <ProfilePage />
      </AuthProvider>
    </ThemeProvider>,
  );

describe("Profile page", () => {
  it("shows the profile, and degrades quietly while /users/stats doesn't exist", async () => {
    serveProfile();

    renderPage();

    expect(await screen.findByDisplayValue("Ana")).toBeInTheDocument();
    expect(screen.getByText("Lv. 3 → 4")).toBeInTheDocument();
    expect(screen.getByText("25% complete")).toBeInTheDocument();
    // No stats → placeholders, not an error.
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("saves only the changed fields and updates from the response without refetching", async () => {
    const state = serveProfile();
    let sent: unknown;
    server.use(
      http.put(api("/users/profile"), async ({ request }) => {
        sent = await request.json();
        state.profile = { ...ana, name: "Ana María", updatedAt: "2026-05-02T00:00:00Z" };
        return HttpResponse.json({ success: true, data: state.profile });
      }),
    );
    const { user } = renderPage();
    const name = await screen.findByLabelText("Display Name");
    const getsBefore = state.profileGets;

    await user.clear(name);
    await user.type(name, "Ana María");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect((await screen.findAllByText("Profile updated"))[0]).toBeInTheDocument();
    expect(sent).toEqual({ name: "Ana María" });
    await waitFor(() => expect(screen.getByLabelText("Display Name")).toHaveValue("Ana María"));
    // PUT returns the full profile → written to the cache, no second GET.
    expect(state.profileGets).toBe(getsBefore);
    // The form remounted with the saved values, so it's clean again.
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled();
  });

  it("validates the form before sending anything", async () => {
    serveProfile();
    const { user } = renderPage();
    const name = await screen.findByLabelText("Display Name");

    await user.clear(name);
    await user.type(name, "A");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByText("Name must be at least 2 characters")).toBeInTheDocument();
  });

  it("shows a retryable error when the profile can't load", async () => {
    serveProfile();
    server.use(http.get(api("/users/profile"), () => new HttpResponse(null, { status: 503 })));

    renderPage();

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("Couldn't load your profile")).toBeInTheDocument();
  });
});
