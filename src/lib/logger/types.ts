export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export type LogMetadata = Record<string, unknown>;

export type LogHandler = (
  level: LogLevel,
  message: string,
  metadata?: LogMetadata
) => void;

export interface LoggerOptions {
  level?: LogLevel;
  handler?: LogHandler;
  prefix?: string;
}
