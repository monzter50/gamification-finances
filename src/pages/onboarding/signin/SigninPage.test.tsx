import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { AuthProvider } from "@/app/providers/AuthProvider";
import { SessionBlockedGate } from "@/components/session/SessionBlockedGate";
import { hasValidSession } from "@/features/auth";
import SigninPage from "@/pages/onboarding/signin";
import { renderWithProviders } from "@/test/render";
import { api, server } from "@/test/server";

const renderSignin = () =>
  renderWithProviders(
    <AuthProvider>
      <SessionBlockedGate />
      <SigninPage />
    </AuthProvider>,
    { signedIn: false },
  );

const submit = async (user: ReturnType<typeof renderSignin>["user"]) => {
  await user.type(screen.getByLabelText("Email"), "ana@example.com");
  await user.type(screen.getByLabelText("Password"), "wrong-password");
  await user.click(screen.getByRole("button", { name: "Log in" }));
};

describe("Sign-in page", () => {
  it("says the credentials are wrong on 401", async () => {
    server.use(
      http.post(api("/auth/login"), () =>
        HttpResponse.json(
          { success: false, message: "Invalid credentials", errorCode: "INVALID_CREDENTIALS" },
          { status: 401 },
        ),
      ),
    );
    const { user } = renderSignin();

    await submit(user);

    expect(
      (await screen.findAllByText("Invalid email or password. Please try again."))[0],
    ).toBeInTheDocument();
  });

  it("shows the blocking screen when a session is already active (409)", async () => {
    server.use(
      http.post(api("/auth/login"), () =>
        HttpResponse.json(
          {
            success: false,
            message: "Session already active",
            errorCode: "SESSION_ALREADY_ACTIVE",
          },
          { status: 409 },
        ),
      ),
    );
    const { user } = renderSignin();

    await submit(user);

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
  });

  it("stores the session and loads the user on success", async () => {
    server.use(
      http.post(api("/auth/login"), () =>
        HttpResponse.json({
          success: true,
          token: "new-token",
          expiresIn: 3600,
          user: { id: "u1", email: "ana@example.com", name: "Ana" },
        }),
      ),
      http.get(api("/auth/me"), () =>
        HttpResponse.json({ success: true, id: "u1", email: "ana@example.com", name: "Ana" }),
      ),
    );
    const { user } = renderSignin();

    await submit(user);

    expect((await screen.findAllByText("Welcome back!"))[0]).toBeInTheDocument();
    expect(hasValidSession()).toBe(true);
    // Signed in → the form is replaced by a redirect home.
    expect(screen.queryByRole("button", { name: "Log in" })).not.toBeInTheDocument();
  });
});
