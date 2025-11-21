/**
 * Authentication Service
 * Handles user authentication, registration, and logout
 */

import type { ApiResponse } from '@aglaya/api-core';
import { apiClient, getAuthToken, setAuthToken, removeAuthToken, setUserData, clearAuthData } from '@/config/api-client';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  UserProfile,
} from '@/types/api';

class AuthService {
  /**
   * Register a new user
   * POST /auth/register
   */
  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', {
      body: data,
    });

    return response;
  }

  /**
   * Login user
   * POST /auth/login
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      body: data,
    });

    console.log('Login response:', response);

    // Save token if login successful
    if (response.status === 'ok' && response.response) {
      console.log('Login successful, response.response:', response.response);

      // The backend returns { success, message, data: { token } }
      // @aglaya/api-core puts this in response.response
      const token = (response.response as any).data?.token || (response.response as any).token;

      if (token) {
        console.log('Token found:', token);
        setAuthToken(token);

        // Fetch and save user profile
        try {
          const userProfile = await this.getMe();
          if (userProfile.status === 'ok' && userProfile.response) {
            setUserData(userProfile.response);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        console.error('No token found in response');
      }
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
      throw new Error("No authentication token found");
    }

    try {
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

      return response;
    } catch (error) {
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
      throw new Error("No authentication token found");
    }

    const response = await apiClient.get<UserProfile>("/auth/me", {
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
