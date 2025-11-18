/**
 * Structured logging utility
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  requestId?: string;
  userId?: string;
  organizationId?: string;
  [key: string]: any;
}

class Logger {
  private context: LogContext = {};

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  clearContext(): void {
    this.context = {};
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...meta,
    };

    if (process.env.NODE_ENV === 'production') {
      // JSON logs for production (ELK, CloudWatch, etc.)
      console.log(JSON.stringify(logEntry));
    } else {
      // Pretty logs for development
      const emoji = {
        [LogLevel.DEBUG]: '🐛',
        [LogLevel.INFO]: 'ℹ️',
        [LogLevel.WARN]: '⚠️',
        [LogLevel.ERROR]: '❌',
      }[level];

      console.log(`${emoji} [${level.toUpperCase()}] ${message}`, meta || '');
    }
  }

  debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, error?: Error | any, meta?: any): void {
    this.log(LogLevel.ERROR, message, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
      ...meta,
    });
  }
}

export const logger = new Logger();
