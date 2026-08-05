import { Effect } from "effect";

import type { CreateLeadDto, LeadListQuery, UpdateLeadDto } from "@kikos/shared";

import { LeadNotFoundError } from "../../../shared/errors/app-error.js";
import type { LeadRepository } from "./lead-repository.js";

export const createLeadService = (leadRepository: LeadRepository) => ({
  list: (query: LeadListQuery) =>
    Effect.tryPromise({
      try: () => leadRepository.list(query),
      catch: (error) => error
    }),

  create: (input: CreateLeadDto) =>
    Effect.tryPromise({
      try: () => leadRepository.create(input),
      catch: (error) => error
    }),

  getById: (leadId: string) =>
    Effect.gen(function* () {
      const lead = yield* Effect.tryPromise({
        try: () => leadRepository.findById(leadId),
        catch: (error) => error
      });

      if (!lead) {
        return yield* Effect.fail(new LeadNotFoundError());
      }

      return lead;
    }),

  update: (leadId: string, input: UpdateLeadDto) =>
    Effect.gen(function* () {
      const lead = yield* Effect.tryPromise({
        try: () => leadRepository.update(leadId, input),
        catch: (error) => error
      });

      if (!lead) {
        return yield* Effect.fail(new LeadNotFoundError());
      }

      return lead;
    })
});

export type LeadService = ReturnType<typeof createLeadService>;
