/**
 * Authentication Service
 * Handles user authentication, registration, and logout.
 *
 * All HTTP calls flow through Orval-generated functions
 * (src/api/generated/authentication). The generated names are auto-derived
 * (`postApiAuthLogin`, …) — they're ugly because the backend OpenAPI spec
 * is missing `operationId` on each route. Once the backend adds
 * `operationId: loginUser` etc., re-run `npm run api:gen` and rename the
 * call sites here. TODO(naming): drop ugly names.
 */

import {
  getApiAuthMe,
  postApiAuthLogin,
  postApiAuthLogout,
  postApiAuthRegister,
} from "@/api/generated/authentication/authentication";
import {
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
} from "@/api/generated/models";
import {
  clearAuthData,
  getAuthExpiry,
  getAuthToken,
  removeAuthExpiry,
  removeAuthToken,
  setAuthExpiry,
  setAuthToken,
} from "@/config/api-client";
import { authLogger } from "@/config/logger";
// UserProfile is still hand-written: the spec's UserProfile schema is missing
// gamification fields (level/experience/coins/totalSavings/achievements/badges/…)
// that profile/index.tsx reads off the auth user. We cast through `unknown` in
// getMe() until the backend spec covers those fields, then drop the cast.
// TODO(spec): align backend UserProfile schema with runtime, remove the cast.
import type { UserProfile } from "@/types/api";
import { ApplicationError } from "@/utils/errors";

import { mapAuthError } from "./auth-errors";

class AuthService {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const res = await postApiAuthRegister(data);

    if (res.status !== 201) {
      authLogger.warn("Registration failed", { status: res.status });
      throw mapAuthError(res.status, {
        intent:    "Registration failed",
        overrides: {
          409: { message: "Email already registered.",     code: "EMAIL_TAKEN" },
          400: { message: "Invalid registration details.", code: "INVALID_INPUT" },
        },
      });
    }

    authLogger.info("Registration successful");
    return res.data;
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const res = await postApiAuthLogin(data);

      if (res.status !== 200) {
        authLogger.warn("Login failed", { status: res.status });
        throw mapAuthError(res.status, {
          intent:    "Login failed",
          overrides: {
            401: { message: "Invalid email or password. Please try again.", code: "INVALID_CREDENTIALS" },
            403: { message: "Account access is restricted.",                code: "FORBIDDEN" },
            400: { message: "Login failed. Please check your credentials.", code: "LOGIN_FAILED" },
          },
        });
      }

      const payload = res.data;
      if (!payload?.token) {
        authLogger.error("Login response missing token");
        throw new ApplicationError(
          "Invalid server response. Please try again.",
          "INVALID_RESPONSE",
          500,
        );
      }

      authLogger.info("Login successful");
      setAuthToken(payload.token);

      return payload;
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }

      // Network-layer errors (offline, CORS, DNS) reach us as raw Error.
      if (error && typeof error === "object" && "message" in error) {
        const message = String((error as { message: unknown }).message);
        if (message.includes("network") || message.includes("fetch") || message.includes("Failed to fetch")) {
          throw new ApplicationError(
            "Network error. Please check your internet connection.",
            "NETWORK_ERROR",
          );
        }
      }

      authLogger.error("Unexpected login error", error);
      throw new ApplicationError(
        "An unexpected error occurred. Please try again.",
        "UNKNOWN_ERROR",
      );
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   *
   * Always clears local auth data, even if the server rejects the call.
   */
  async logout(): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      authLogger.warn("Logout attempted without token");
      throw new ApplicationError("No authentication token found", "NO_TOKEN");
    }

    try {
      authLogger.debug("Logging out user");
      const res = await postApiAuthLogout();

      if (res.status !== 200) {
        authLogger.warn("Logout returned non-200", { status: res.status });
        // Fall through to local cleanup — don't strand the user logged in
        // client-side because the server hiccuped.
      } else {
        authLogger.info("User logged out successfully");
      }
    } catch (error) {
      authLogger.error("Logout error", error);
      // Same idea: never block local logout on a server failure.
    } finally {
      clearAuthData();
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getMe(): Promise<UserProfile> {
    const token = getAuthToken();
    if (!token) {
      authLogger.warn("getMe called without token");
      throw new ApplicationError("No authentication token found", "NO_TOKEN");
    }

    authLogger.debug("Fetching user profile");
    const res = await getApiAuthMe();

    if (res.status !== 200) {
      authLogger.warn("getMe failed", { status: res.status });
      throw mapAuthError(res.status, { intent: "Failed to load profile" });
    }

    authLogger.debug("User profile fetched successfully");
    // See top-of-file note: cast through unknown until backend UserProfile
    // schema includes the gamification fields consumed by profile/index.tsx.
    return res.data as unknown as UserProfile;
  }

  /**
   * Check if user is authenticated and token is not expired.
   */
  isAuthenticated(): boolean {
    const token = getAuthToken();
    if (!token) { return false; }

    const expiry = getAuthExpiry();
    if (!expiry) { return false; }

    // expiry is stored as an absolute ms timestamp. Backend returns
    // `expiresIn` as seconds-from-issue; AuthContext.login converts to
    // absolute ms before calling setAuthExpiry, so this comparison is
    // correct end-to-end.
    if (Date.now() >= expiry) {
      authLogger.debug("Token expired", { expiry, now: Date.now() });
      this.clearAuthData();
      return false;
    }
    return true;
  }

  getToken(): string | null { return getAuthToken(); }
  getExpiry(): number | null { return getAuthExpiry(); }

  setExpiry(expiresIn: number): void {
    setAuthExpiry(expiresIn);
  }

  clearAuthData(): void {
    removeAuthToken();
    removeAuthExpiry();
  }
}

export const authService = new AuthService();
