import { env } from "../../../../shared/config/env.js";
import type { DealSummaryProvider } from "../../application/ports/deal-summary-provider.js";
import { createGeminiDealSummaryProvider } from "./gemini-deal-summary-provider.js";
import { createMockDealSummaryProvider } from "./mock-deal-summary-provider.js";

export const createDealSummaryProvider = (): DealSummaryProvider => {
  if (env.AI_PROVIDER === "gemini" && env.GEMINI_API_KEY) {
    return createGeminiDealSummaryProvider({
      apiKey: env.GEMINI_API_KEY,
      model: env.GEMINI_MODEL,
      timeoutMs: env.AI_TIMEOUT_MS
    });
  }

  return createMockDealSummaryProvider();
};
