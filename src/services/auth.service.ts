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

    const { response, status } = await apiClient.post<LoginResponse>("/auth/login", {
      body: {
        email: data.email,
        password: data.password,
      },
    });

    if (!response && status !== "ok") {
      throw new Error("Login failed with no response");
    }

    if (!response?.token) {
      throw new Error("Login response missing token");
    }

    authLogger.debug("Login response received", { status: status });

    // Save token if login successful
    authLogger.info("Login successful");

    // The backend returns { success, message, data: { token } }
    // @aglaya/api-core puts this in response.response
    const token = response?.token ?? "";
    const expiresIn = response?.expiresIn ?? 0;

    authLogger.debug("Token extracted successfully");
    setAuthToken(token);

    return {
      token,
      expiresIn,
    };
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
