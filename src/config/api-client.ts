/**
 * API Client Configuration
 * Configures the ApiClient from @aglaya/api-core
 */

import { ApiClient } from "@aglaya/api-core";

import { env } from "./env";

// Create and export the API client instance.
// The endpoint is selected by Vite mode at build/dev time — see src/config/env.ts
export const apiClient = new ApiClient({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  contentType: "application/json",
});

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

/**
 * Set authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem("authToken");
};

/**
 * Set authentication expiry in localStorage
 */
export const setAuthExpiry = (expiresIn: number): void => {
  localStorage.setItem("authExpiry", String(expiresIn));
};

/**
 * Get authentication expiry from localStorage
 */
export const getAuthExpiry = (): number | null => {
  const expiresIn = localStorage.getItem("authExpiry");
  return expiresIn ? Number(expiresIn) : null;
};

/**
 * Remove authentication expiry from localStorage
 */
export const removeAuthExpiry = (): void => {
  localStorage.removeItem("authExpiry");
};

/**
 * Set user data in localStorage
 */
export const setUserData = (user: unknown): void => {
  localStorage.setItem("userData", JSON.stringify(user));
};

/**
 * Get user data from localStorage
 */
export const getUserData = <T>(): T | null => {
  const data = localStorage.getItem("userData");
  return data ? JSON.parse(data) : null;
};

/**
 * Remove user data from localStorage
 */
export const removeUserData = (): void => {
  localStorage.removeItem("userData");
};

/**
 * Clear all auth data from localStorage
 */
export const clearAuthData = (): void => {
  removeAuthToken();
  removeUserData();
};
