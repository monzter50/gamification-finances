/**
 * Authentication Service
 * Handles user authentication, registration, and logout
 */

import type { ApiResponse } from "@aglaya/api-core";

import { apiClient, getAuthToken, setAuthToken, clearAuthData, setAuthExpiry, removeAuthToken, removeAuthExpiry, getAuthExpiry } from "@/config/api-client";
import { authLogger } from "@/config/logger";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  UserProfile,
} from "@/types/api";
import { ApplicationError } from "@/utils/errors";

class AuthService {
  /**
   * Register a new user
   * POST /auth/register
   */
  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const response = await apiClient.post<RegisterResponse>("/auth/register", {
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    });

    return response;
  }

  /**
   * Login user
   * POST /auth/login
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const {
        response,
        status,
        statusCode
      } = await apiClient.post<LoginResponse>("/auth/login", {
        body: {
          email: data.email,
          password: data.password,
        },
      });

      // Handle API errors
      if (status !== "ok") {
        authLogger.warn("Login failed", {
          status,
          statusCode
        });

        // Map status codes to specific errors
        if (statusCode === 401) {
          throw new ApplicationError(
            "Invalid email or password. Please try again.",
            "INVALID_CREDENTIALS",
            401
          );
        }

        if (statusCode === 429) {
          throw new ApplicationError(
            "Too many login attempts. Please try again later.",
            "TOO_MANY_REQUESTS",
            429
          );
        }

        if (statusCode && statusCode >= 500) {
          throw new ApplicationError(
            "Server error. Please try again later.",
            "SERVER_ERROR",
            statusCode
          );
        }

        throw new ApplicationError(
          "Login failed. Please check your credentials.",
          "LOGIN_FAILED",
          statusCode || 400
        );
      }

      if (!response?.token) {
        authLogger.error("Login response missing token");
        throw new ApplicationError(
          "Invalid server response. Please try again.",
          "INVALID_RESPONSE",
          500
        );
      }

      authLogger.debug("Login response received", { status });
      authLogger.info("Login successful");

      const token = response.token;
      const expiresIn = response.expiresIn ?? 0;

      authLogger.debug("Token extracted successfully");
      setAuthToken(token);

      return {
        token,
        expiresIn,
      };
    } catch (error) {
      // If it's already an ApplicationError, re-throw it
      if (error instanceof ApplicationError) {
        throw error;
      }

      // Handle network errors
      if (error && typeof error === "object" && "message" in error) {
        const message = String(error.message);
        if (message.includes("network") || message.includes("fetch")) {
          throw new ApplicationError(
            "Network error. Please check your internet connection.",
            "NETWORK_ERROR"
          );
        }
      }

      // Generic error fallback
      authLogger.error("Unexpected login error", error);
      throw new ApplicationError(
        "An unexpected error occurred. Please try again.",
        "UNKNOWN_ERROR"
      );
    }
  }

  /**
   * Logout user
   * POST /auth/logout
   */
  async logout(): Promise<ApiResponse<void>> {
    const token = getAuthToken();

    if (!token) {
      authLogger.warn("Logout attempted without token");
      throw new Error("No authentication token found");
    }

    try {
      authLogger.debug("Logging out user");

      const response = await apiClient.post<void>("/auth/logout", {
        authentication: {
          token,
        },
        options: {
          requiredAuth: true,
        },
      });

      // Clear local auth data
      clearAuthData();
      authLogger.info("User logged out successfully");

      return response;
    } catch (error) {
      authLogger.error("Logout error", error);
      // Clear local data even if API call fails
      clearAuthData();
      throw error;
    }
  }

  /**
   * Get current user profile
   * GET /auth/me
   */
  async getMe(): Promise<UserProfile> {
    const token = getAuthToken();

    if (!token) {
      authLogger.warn("getMe called without token");
      throw new Error("No authentication token found");
    }

    authLogger.debug("Fetching user profile");

    const { response, status } = await apiClient.get<UserProfile>("/auth/me", {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    if (status === "ok") {
      authLogger.debug("User profile fetched successfully");
    } else {
      authLogger.warn("Failed to fetch user profile", { status: status });
    }

    return {
      ...response,
    };
  }

  /**
   * Check if user is authenticated and token is not expired
   */
  isAuthenticated(): boolean {
    const token = getAuthToken();
    if (!token) {
      return false;
    }

    const expiry = getAuthExpiry();
    if (!expiry) {
      return false;
    }

    // Check if token is expired (expiry is in milliseconds)
    const now = Date.now();
    if (now >= expiry) {
      authLogger.debug("Token expired", {
        expiry,
        now
      });
      this.clearAuthData();
      return false;
    }

    return true;
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return getAuthToken();
  }

  /**
   * Get stored auth expiry
   */
  getExpiry(): number | null {
    return getAuthExpiry();
  }

  /**
   * Set stored auth expiry
   */
  setExpiry(expiresIn: number): void {
    setAuthExpiry(expiresIn);
  }

  /**
   * Clear stored auth data
   */
  clearAuthData(): void {
    removeAuthToken();
    removeAuthExpiry();
  }

}

export const authService = new AuthService();
