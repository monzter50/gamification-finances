/**
 * Authentication Service
 * Handles user authentication, registration, and logout
 */

import type { ApiResponse } from "@aglaya/api-core";

import { apiClient, getAuthToken, setAuthToken, setUserData, clearAuthData } from "@/config/api-client";
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
      body: data,
    });

    return response;
  }

  /**
   * Login user
   * POST /auth/login
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    authLogger.debug("Login attempt", { email: data.email });

    const response = await apiClient.post<LoginResponse>("/auth/login", {
      body: data,
    });

    authLogger.debug("Login response received", { status: response.status });

    // Save token if login successful
    if (response.status === "ok" && response.response) {
      authLogger.info("Login successful");

      // The backend returns { success, message, data: { token } }
      // @aglaya/api-core puts this in response.response
      const responseData = response.response as { data?: { token?: string }; token?: string };
      const token = responseData.data?.token || responseData.token;

      if (token) {
        authLogger.debug("Token extracted successfully");
        setAuthToken(token);

        // Fetch and save user profile
        try {
          const userProfile = await this.getMe();
          if (userProfile.status === "ok" && userProfile.response) {
            setUserData(userProfile.response);
            authLogger.info("User profile loaded", {
              userId: userProfile.response.id,
              email: userProfile.response.email,
            });
          }
        } catch (error) {
          authLogger.error("Error fetching user profile", error);
        }
      } else {
        authLogger.error("No token found in response");
      }
    } else {
      authLogger.warn("Login failed", { status: response.status });
    }

    return response;
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
  async getMe(): Promise<ApiResponse<UserProfile>> {
    const token = getAuthToken();

    if (!token) {
      authLogger.warn("getMe called without token");
      throw new Error("No authentication token found");
    }

    authLogger.debug("Fetching user profile");

    const response = await apiClient.get<UserProfile>("/auth/me", {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    if (response.status === "ok") {
      authLogger.debug("User profile fetched successfully");
    } else {
      authLogger.warn("Failed to fetch user profile", { status: response.status });
    }

    return response;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!getAuthToken();
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return getAuthToken();
  }
}

export const authService = new AuthService();
