import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z
    .string()
    .url()
    .default("postgresql://postgres:postgres@localhost:5432/kikos_crm"),
  JWT_SECRET: z.string().min(1).default("change-me-in-development"),
  JWT_EXPIRES_IN: z.string().min(1).default("8h"),
  CORS_ORIGIN: z.string().url().default("http://localhost:5173"),
  AI_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional()
});

export const env = envSchema.parse(process.env);
