/**
 * Error utilities for handling API and application errors
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Custom error class for application errors
 */
export class ApplicationError extends Error {
  code?: string;
  statusCode?: number;

  constructor(message: string, code?: string, statusCode?: number) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Map of common HTTP status codes to user-friendly messages
 */
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input.",
  401: "Invalid credentials. Please try again.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  408: "Request timeout. Please try again.",
  409: "A conflict occurred. Please refresh and try again.",
  422: "Invalid data provided. Please check your input.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Server error. Please try again later.",
  502: "Bad gateway. Please try again later.",
  503: "Service unavailable. Please try again later.",
  504: "Gateway timeout. Please try again later.",
};

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  // If it's already a string, return it
  if (typeof error === "string") {
    return error;
  }

  // If it's an ApplicationError
  if (error instanceof ApplicationError) {
    return error.message;
  }

  // If it's a standard Error
  if (error instanceof Error) {
    return error.message;
  }

  // If it's an object with a message property
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  // Default fallback
  return "An unexpected error occurred.";
};

/**
 * Get user-friendly error message based on HTTP status code
 */
export const getHttpErrorMessage = (statusCode?: number): string => {
  if (!statusCode) {
    return "Network error. Please check your connection.";
  }

  return HTTP_ERROR_MESSAGES[statusCode] || "An error occurred. Please try again.";
};

/**
 * Parse API error response and extract meaningful error message
 */
export const parseApiError = (error: unknown): AppError => {
  // Network error
  if (error && typeof error === "object" && "name" in error && error.name === "NetworkError") {
    return {
      message: "Network error. Please check your internet connection.",
      code: "NETWORK_ERROR",
    };
  }

  // Timeout error
  if (error && typeof error === "object" && "name" in error && error.name === "TimeoutError") {
    return {
      message: "Request timeout. Please try again.",
      code: "TIMEOUT_ERROR",
      statusCode: 408,
    };
  }

  // API response error with status code
  if (error && typeof error === "object" && "statusCode" in error) {
    const statusCode = Number(error.statusCode);
    const message = "message" in error ? String(error.message) : getHttpErrorMessage(statusCode);

    return {
      message,
      statusCode,
      code: "code" in error ? String(error.code) : undefined,
    };
  }

  // Standard error
  if (error instanceof Error) {
    return {
      message: error.message,
      code: "code" in error ? String(error.code) : undefined,
    };
  }

  // Fallback
  return {
    message: getErrorMessage(error),
  };
};

/**
 * Auth-specific error messages
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  TOKEN_INVALID: "Invalid authentication token. Please log in again.",
  NO_TOKEN: "You are not logged in. Please log in to continue.",
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
} as const;

/**
 * Get auth-specific error message
 */
export const getAuthErrorMessage = (error: unknown): string => {
  const parsedError = parseApiError(error);

  // Map status codes to auth-specific messages
  switch (parsedError.statusCode) {
  case 401:
    return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS;
  case 403:
    return AUTH_ERROR_MESSAGES.TOKEN_INVALID;
  case 419:
    return AUTH_ERROR_MESSAGES.TOKEN_EXPIRED;
  default:
    if (parsedError.code === "NETWORK_ERROR") {
      return AUTH_ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (parsedError.statusCode && parsedError.statusCode >= 500) {
      return AUTH_ERROR_MESSAGES.SERVER_ERROR;
    }
    return parsedError.message || AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};
