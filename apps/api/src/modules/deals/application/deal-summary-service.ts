import { Effect } from "effect";

import type { AuthenticatedUser, DealAiSummaryDto } from "@kikos/shared";

import { AiSummaryUnavailableError, DealNotFoundError } from "../../../shared/errors/app-error.js";
import type { DealRepository } from "./ports/deal-repository.js";
import type { DealSummaryProvider } from "./ports/deal-summary-provider.js";

export const createDealSummaryService = (
  dealRepository: DealRepository,
  summaryProvider: DealSummaryProvider
) => ({
  generate: (dealId: string, user: AuthenticatedUser) =>
    Effect.gen(function* () {
      const deal = yield* Effect.tryPromise({
        try: () => dealRepository.findById(dealId, user),
        catch: (error) => error
      });

      if (!deal) {
        return yield* Effect.fail(new DealNotFoundError());
      }

      const result = yield* Effect.tryPromise({
        try: () =>
          summaryProvider.summarize({
            dealTitle: deal.title,
            leadName: deal.lead?.name ?? null,
            comments: deal.comments.map((comment) => comment.content)
          }),
        catch: () => new AiSummaryUnavailableError()
      });

      return {
        summary: result.summary,
        provider: result.provider,
        generatedAt: new Date().toISOString()
      } satisfies DealAiSummaryDto;
    })
});

export type DealSummaryService = ReturnType<typeof createDealSummaryService>;
