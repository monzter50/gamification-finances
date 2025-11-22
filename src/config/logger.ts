/**
 * Logger Configuration
 * Central logger instances for the application
 */

import { createLogger, LogLevel } from "@aglaya/logger";

// Determine log level based on environment
const logLevel = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO;

// Main application logger
export const appLogger = createLogger({
  prefix: "App",
  level: logLevel,
  timestamps: true,
  colors: true,
});

// Service-specific loggers
export const authLogger = appLogger.child("Auth");
export const userLogger = appLogger.child("User");
export const transactionLogger = appLogger.child("Transaction");
export const achievementLogger = appLogger.child("Achievement");
export const gamificationLogger = appLogger.child("Gamification");
export const apiLogger = appLogger.child("API");
