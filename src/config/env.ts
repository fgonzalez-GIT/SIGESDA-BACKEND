import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Server
  PORT: z.string().transform(Number).default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // JWT (for future use)
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Email (optional for now)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Pagination
  DEFAULT_PAGE_SIZE: z.string().transform(Number).default('20'),
  MAX_PAGE_SIZE: z.string().transform(Number).default('100'),

  // Business rules
  CUOTA_VENCIMIENTO_DIAS: z.string().transform(Number).default('10'),
  RECIBO_NUMERACION_INICIO: z.string().transform(Number).default('1000'),

  // File upload (for future use)
  MAX_FILE_SIZE_MB: z.string().transform(Number).default('5'),
  UPLOAD_PATH: z.string().default('uploads/'),
});

// Validate and export environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Configuración de environment inválida:');
  console.error(parseResult.error.format());
  process.exit(1);
}

export const env = parseResult.data;

// Helper functions
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';