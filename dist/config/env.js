"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isProduction = exports.isDevelopment = exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    PORT: zod_1.z.string().transform(Number).default('3001'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    JWT_SECRET: zod_1.z.string().min(1, 'JWT_SECRET is required'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().transform(Number).optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    DEFAULT_PAGE_SIZE: zod_1.z.string().transform(Number).default('20'),
    MAX_PAGE_SIZE: zod_1.z.string().transform(Number).default('100'),
    CUOTA_VENCIMIENTO_DIAS: zod_1.z.string().transform(Number).default('10'),
    RECIBO_NUMERACION_INICIO: zod_1.z.string().transform(Number).default('1000'),
    MAX_FILE_SIZE_MB: zod_1.z.string().transform(Number).default('5'),
    UPLOAD_PATH: zod_1.z.string().default('uploads/'),
});
const parseResult = envSchema.safeParse(process.env);
if (!parseResult.success) {
    console.error('❌ Configuración de environment inválida:');
    console.error(parseResult.error.format());
    process.exit(1);
}
exports.env = parseResult.data;
const isDevelopment = () => exports.env.NODE_ENV === 'development';
exports.isDevelopment = isDevelopment;
const isProduction = () => exports.env.NODE_ENV === 'production';
exports.isProduction = isProduction;
const isTest = () => exports.env.NODE_ENV === 'test';
exports.isTest = isTest;
//# sourceMappingURL=env.js.map