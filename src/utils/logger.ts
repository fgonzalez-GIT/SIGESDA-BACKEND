import { env } from '@/config/env';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private currentLevel: LogLevel;

  constructor() {
    this.currentLevel = this.getLogLevel(env.LOG_LEVEL);
  }

  private getLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'error': return LogLevel.ERROR;
      case 'warn': return LogLevel.WARN;
      case 'info': return LogLevel.INFO;
      case 'debug': return LogLevel.DEBUG;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLevel;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('error', message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('info', message, meta));
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('debug', message, meta));
    }
  }

  // Helper methods for common scenarios
  request(method: string, url: string, statusCode: number, duration?: number): void {
    const message = `${method} ${url} - ${statusCode}`;
    const meta = duration ? { duration: `${duration}ms` } : undefined;

    if (statusCode >= 500) {
      this.error(message, meta);
    } else if (statusCode >= 400) {
      this.warn(message, meta);
    } else {
      this.info(message, meta);
    }
  }

  database(operation: string, table?: string, duration?: number): void {
    const message = table ? `DB ${operation} on ${table}` : `DB ${operation}`;
    const meta = duration ? { duration: `${duration}ms` } : undefined;
    this.debug(message, meta);
  }
}

export const logger = new Logger();