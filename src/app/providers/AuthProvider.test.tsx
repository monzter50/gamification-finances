import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { AuthProvider, useAuth } from "@/app/providers/AuthProvider";
import { hasValidSession, saveSession } from "@/features/auth";
import { renderWithProviders } from "@/test/render";
import { api, server } from "@/test/server";

const SessionProbe = () => {
  const { isAuthenticated, isCheckingSession, logout } = useAuth();
  return (
    <>
      <p>{isCheckingSession ? "checking" : isAuthenticated ? "signed in" : "signed out"}</p>
      <button type="button" onClick={() => void logout()}>
        Log out
      </button>
    </>
  );
};

const renderWithStoredSession = () => {
  saveSession("stored-token", 3600);
  return renderWithProviders(
    <AuthProvider>
      <SessionProbe />
    </AuthProvider>,
    { signedIn: false },
  );
};

const me = {
  success: true,
  id: "u1",
  email: "ana@example.com",
  name: "Ana",
  role: "user",
  isActive: true,
};

describe("AuthProvider", () => {
  it("restores a stored session once /auth/me accepts the token", async () => {
    server.use(http.get(api("/auth/me"), () => HttpResponse.json(me)));

    renderWithStoredSession();

    expect(screen.getByText("checking")).toBeInTheDocument();
    expect(await screen.findByText("signed in")).toBeInTheDocument();
  });

  it("signs out when the backend rejects the stored token (401)", async () => {
    server.use(
      http.get(api("/auth/me"), () =>
        HttpResponse.json({ success: false, message: "Invalid token" }, { status: 401 }),
      ),
    );

    renderWithStoredSession();

    expect(await screen.findByText("signed out")).toBeInTheDocument();
    expect(hasValidSession()).toBe(false);
  });

  it("stays signed in when /auth/me fails for another reason (5xx / offline)", async () => {
    server.use(http.get(api("/auth/me"), () => new HttpResponse(null, { status: 503 })));

    renderWithStoredSession();

    expect(await screen.findByText("signed in")).toBeInTheDocument();
    expect(hasValidSession()).toBe(true);
  });

  it("logs out locally even when the logout request fails", async () => {
    server.use(
      http.get(api("/auth/me"), () => HttpResponse.json(me)),
      http.post(api("/auth/logout"), () => new HttpResponse(null, { status: 500 })),
    );
    const { user } = renderWithStoredSession();
    await screen.findByText("signed in");

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(await screen.findByText("signed out")).toBeInTheDocument();
    await waitFor(() => expect(hasValidSession()).toBe(false));
  });
});
