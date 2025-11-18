/**
 * Logger utility with configurable log levels
 * Set LOG_LEVEL environment variable to control logging:
 * - 'error' (default): Only errors
 * - 'warn': Errors and warnings
 * - 'info': Errors, warnings, and info
 * - 'debug': All logs
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private level: LogLevel;

  constructor() {
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL?.toLowerCase() || 'error';
    this.level = this.parseLogLevel(envLevel);
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
      default:
        return LogLevel.ERROR;
    }
  }

  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.INFO) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();

