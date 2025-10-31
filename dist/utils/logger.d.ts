export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
declare class Logger {
    private currentLevel;
    constructor();
    private getLogLevel;
    private shouldLog;
    private formatMessage;
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
    request(method: string, url: string, statusCode: number, duration?: number): void;
    database(operation: string, table?: string, duration?: number): void;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map