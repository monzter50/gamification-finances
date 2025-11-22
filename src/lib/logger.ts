import { createLogger, LogLevel } from "@aglaya/logger";

// Create configured logger instance for the application
export const logger = createLogger({
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
  prefix: "FinancesGamification",
  colors: true,
  timestamps: true,
});

// Create child loggers for different modules
export const authLogger = logger.child("Auth");
export const gamificationLogger = logger.child("Gamification");
export const themeLogger = logger.child("Theme");
