/**
 * Achievement Service
 * Handles user achievements and unlocking
 */

import type { ApiResponse } from '@aglaya/api-core';
import { apiClient, getAuthToken } from '@/config/api-client';
import type {
  Achievement,
  UserAchievementsResponse,
  UnlockAchievementResponse,
} from '@/types/api';

class AchievementService {
  /**
   * Get all available achievements
   * GET /achievements
   */
  async getAll(): Promise<ApiResponse<Achievement[]>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get<Achievement[]>('/achievements', {
      authentication: {
        token,
      },
    });

    return response;
  }

  /**
   * Get user achievements with unlock status
   * GET /achievements/user
   */
  async getUserAchievements(): Promise<ApiResponse<UserAchievementsResponse>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get<UserAchievementsResponse>('/achievements/user', {
      authentication: {
        token,
      },
    });

    return response;
  }

  /**
   * Unlock an achievement (for testing)
   * POST /achievements/:id/unlock
   */
  async unlock(achievementId: string): Promise<ApiResponse<UnlockAchievementResponse>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.post<UnlockAchievementResponse>(
      `/achievements/${achievementId}/unlock`,
      {
        authentication: {
          token,
        },
      }
    );

    return response;
  }

  /**
   * Get achievement progress
   * GET /achievements/:id/progress
   */
  async getProgress(achievementId: string): Promise<ApiResponse<{ progress: number }>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get<{ progress: number }>(
      `/achievements/${achievementId}/progress`,
      {
        authentication: {
          token,
        },
      }
    );

    return response;
  }
}

export const achievementService = new AchievementService();
