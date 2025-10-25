import { LogLevel, LogHandler, LoggerOptions, LogMetadata } from "./types";

const logLevelPriority: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

const defaultHandler: LogHandler = (level, message, metadata) => {
  const timestamp = new Date().toISOString();
  const meta = metadata ? ` ${JSON.stringify(metadata)}` : "";

  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}${meta}`;

  switch (level) {
  case LogLevel.ERROR:
    console.error(logMessage);
    break;
  case LogLevel.WARN:
    console.warn(logMessage);
    break;
  case LogLevel.INFO:
    console.info(logMessage);
    break;
  case LogLevel.DEBUG:
  default:
    console.log(logMessage);
    break;
  }
};

export class Logger {
  private level: LogLevel;
  private handler: LogHandler;
  private prefix: string;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || LogLevel.INFO;
    this.handler = options.handler || defaultHandler;
    this.prefix = options.prefix || "";
  }

  private shouldLog(level: LogLevel): boolean {
    return logLevelPriority[level] >= logLevelPriority[this.level];
  }

  private formatMessage(message: string): string {
    return this.prefix ? `[${this.prefix}] ${message}` : message;
  }

  debug(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.handler(LogLevel.DEBUG, this.formatMessage(message), metadata);
    }
  }

  info(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.handler(LogLevel.INFO, this.formatMessage(message), metadata);
    }
  }

  warn(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.handler(LogLevel.WARN, this.formatMessage(message), metadata);
    }
  }

  error(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.handler(LogLevel.ERROR, this.formatMessage(message), metadata);
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }
}

export const createLogger = (options?: LoggerOptions): Logger => {
  return new Logger(options);
};

// Default logger instance
export const logger = createLogger({
  level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
});
