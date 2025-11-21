/**
 * User Service
 * Handles user profile and statistics
 */

import type { ApiResponse } from "@aglaya/api-core";
import { apiClient, getAuthToken } from "@/config/api-client";
import type {
  UserProfileData,
  UpdateProfileRequest,
  UserStats,
} from "@/types/api";

class UserService {
  /**
   * Get user profile with gamification data
   * GET /users/profile
   */
  async getProfile(): Promise<ApiResponse<UserProfileData>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await apiClient.get<UserProfileData>("/users/profile", {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    return response;
  }

  /**
   * Update user profile
   * PUT /users/profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfileData>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await apiClient.put<UserProfileData>("/users/profile", {
      body: {
        ...data,
      },
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    return response;
  }

  /**
   * Get user statistics
   * GET /users/stats
   */
  async getStats(): Promise<ApiResponse<UserStats>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await apiClient.get<UserStats>("/users/stats", {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    return response;
  }
}

export const userService = new UserService();
