"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
const env_1 = require("@/config/env");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor() {
        this.currentLevel = this.getLogLevel(env_1.env.LOG_LEVEL);
    }
    getLogLevel(level) {
        switch (level.toLowerCase()) {
            case 'error': return LogLevel.ERROR;
            case 'warn': return LogLevel.WARN;
            case 'info': return LogLevel.INFO;
            case 'debug': return LogLevel.DEBUG;
            default: return LogLevel.INFO;
        }
    }
    shouldLog(level) {
        return level <= this.currentLevel;
    }
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
    }
    error(message, meta) {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.formatMessage('error', message, meta));
        }
    }
    warn(message, meta) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.formatMessage('warn', message, meta));
        }
    }
    info(message, meta) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.log(this.formatMessage('info', message, meta));
        }
    }
    debug(message, meta) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.log(this.formatMessage('debug', message, meta));
        }
    }
    request(method, url, statusCode, duration) {
        const message = `${method} ${url} - ${statusCode}`;
        const meta = duration ? { duration: `${duration}ms` } : undefined;
        if (statusCode >= 500) {
            this.error(message, meta);
        }
        else if (statusCode >= 400) {
            this.warn(message, meta);
        }
        else {
            this.info(message, meta);
        }
    }
    database(operation, table, duration) {
        const message = table ? `DB ${operation} on ${table}` : `DB ${operation}`;
        const meta = duration ? { duration: `${duration}ms` } : undefined;
        this.debug(message, meta);
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map