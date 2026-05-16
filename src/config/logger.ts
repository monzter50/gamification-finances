/**
 * Logger Configuration
 * Central logger instances for the application
 */

import { createLogger, LogLevel } from "@aglaya/logger";

import { env } from "./env";

// Determine log level based on the resolved app environment
const logLevel = env.enableDebugLogs ? LogLevel.DEBUG : LogLevel.INFO;

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
export const budgetLogger = appLogger.child("Budget");
export const apiLogger = appLogger.child("API");
