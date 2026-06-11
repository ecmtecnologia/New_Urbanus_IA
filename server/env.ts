import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8787),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(16).default('change-this-secret-in-production'),
  GEMINI_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);
