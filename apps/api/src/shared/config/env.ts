import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/kikos_crm"),
  JWT_SECRET: z.string().min(1).default("change-me-in-development"),
  JWT_EXPIRES_IN: z.string().min(1).default("8h"),
  CORS_ORIGIN: z.string().url().default("http://localhost:5173"),
  AI_PROVIDER: z.enum(["mock", "gemini"]).default("mock"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-3.5-flash"),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(30000)
});

export const env = envSchema.parse(process.env);
