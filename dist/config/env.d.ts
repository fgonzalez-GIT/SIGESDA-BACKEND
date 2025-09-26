export declare const env: {
    DATABASE_URL: string;
    PORT: number;
    NODE_ENV: "development" | "production" | "test";
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    LOG_LEVEL: "error" | "warn" | "info" | "debug";
    DEFAULT_PAGE_SIZE: number;
    MAX_PAGE_SIZE: number;
    CUOTA_VENCIMIENTO_DIAS: number;
    RECIBO_NUMERACION_INICIO: number;
    MAX_FILE_SIZE_MB: number;
    UPLOAD_PATH: string;
    SMTP_HOST?: string | undefined;
    SMTP_PORT?: number | undefined;
    SMTP_USER?: string | undefined;
    SMTP_PASS?: string | undefined;
};
export declare const isDevelopment: () => boolean;
export declare const isProduction: () => boolean;
export declare const isTest: () => boolean;
//# sourceMappingURL=env.d.ts.map