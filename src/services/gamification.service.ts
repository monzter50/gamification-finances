/**
 * Gamification Service
 * Handles gamification features, levels, leaderboards, and progress
 */

import type { ApiResponse } from '@aglaya/api-core';
import { apiClient, getAuthToken } from '@/config/api-client';
import type {
  GamificationProfile,
  LevelUpResponse,
  LeaderboardResponse,
  LeaderboardType,
  ProgressStats,
  AddCoinsRequest,
  AddCoinsResponse,
} from '@/types/api';

class GamificationService {
  /**
   * Get gamification profile
   * GET /gamification/profile
   */
  async getProfile(): Promise<ApiResponse<GamificationProfile>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get<GamificationProfile>('/gamification/profile', {
      authentication: {
        token,
      },
    });

    return response;
  }

  /**
   * Add experience and level up (for testing)
   * POST /gamification/level-up
   */
  async levelUp(): Promise<ApiResponse<LevelUpResponse>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.post<LevelUpResponse>('/gamification/level-up', {
      authentication: {
        token,
      },
    });

    return response;
  }

  /**
   * Get leaderboard
   * GET /gamification/leaderboard
   */
  async getLeaderboard(
    type: LeaderboardType = 'level',
    limit: number = 10
  ): Promise<ApiResponse<LeaderboardResponse>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get<LeaderboardResponse>('/gamification/leaderboard', {
      params: {
        type,
        limit,
      },
      authentication: {
        token,
      },
    });

    return response;
  }

  /**
   * Get progress statistics
   * GET /gamification/progress
   */
  async getProgress(): Promise<ApiResponse<ProgressStats>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get<ProgressStats>('/gamification/progress', {
      authentication: {
        token,
      },
    });

    return response;
  }

  /**
   * Add coins to user account (for testing)
   * POST /gamification/add-coins
   */
  async addCoins(amount: number): Promise<ApiResponse<AddCoinsResponse>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const data: AddCoinsRequest = { amount };

    const response = await apiClient.post<AddCoinsResponse>('/gamification/add-coins', {
      body: data,
      authentication: {
        token,
      },
    });

    return response;
  }
}

export const gamificationService = new GamificationService();
