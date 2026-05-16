/**
 * User Service
 * Handles user profile and statistics.
 *
 * Contract: docs/api-routes.md → User Management section.
 */

import { apiClient, getAuthToken } from "@/config/api-client";
import type {
  ApiResponse,
  UpdateProfileRequest,
  UserProfileData,
  UserStats,
} from "@/types/api";

function requireToken(): string {
  const token = getAuthToken();
  if (!token) { throw new Error("No authentication token found"); }
  return token;
}

class UserService {
  /**
   * GET /users/profile — detailed profile with gamification data.
   */
  async getProfile(): Promise<ApiResponse<UserProfileData>> {
    const token = requireToken();

    const { status, response } = await apiClient.get<ApiResponse<UserProfileData>>(
      "/users/profile",
      {
        authentication: { token },
        options: { requiredAuth: true },
      }
    );

    return {
      success: status === "ok",
      data: response?.data as UserProfileData,
      message: response?.message ?? "",
    };
  }

  /**
   * PUT /users/profile — update profile (name, savingsGoal).
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfileData>> {
    const token = requireToken();

    const { status, response } = await apiClient.put<ApiResponse<UserProfileData>>(
      "/users/profile",
      {
        body: { ...data },
        authentication: { token },
        options: { requiredAuth: true },
      }
    );

    return {
      success: status === "ok",
      data: response?.data as UserProfileData,
      message: response?.message ?? "",
    };
  }

  /**
   * GET /users/stats — comprehensive user statistics.
   */
  async getStats(): Promise<ApiResponse<UserStats>> {
    const token = requireToken();

    const { status, response } = await apiClient.get<ApiResponse<UserStats>>(
      "/users/stats",
      {
        authentication: { token },
        options: { requiredAuth: true },
      }
    );

    return {
      success: status === "ok",
      data: response?.data as UserStats,
      message: response?.message ?? "",
    };
  }
}

export const userService = new UserService();
