import { Effect } from "effect";

import type { AuthenticatedUser, CreateCommentDto } from "@kikos/shared";

import { DealNotFoundError, LeadNotFoundError } from "../../../shared/errors/app-error.js";
import type { CommentRepository } from "./comment-repository.js";

export const createCommentService = (commentRepository: CommentRepository) => ({
  listByLead: (leadId: string) =>
    Effect.gen(function* () {
      const comments = yield* Effect.tryPromise({
        try: () => commentRepository.listByLead(leadId),
        catch: (error) => error
      });

      if (!comments) {
        return yield* Effect.fail(new LeadNotFoundError());
      }

      return comments;
    }),

  createForLead: (leadId: string, input: CreateCommentDto, authorId: string) =>
    Effect.gen(function* () {
      const comment = yield* Effect.tryPromise({
        try: () => commentRepository.createForLead(leadId, input, authorId),
        catch: (error) => error
      });

      if (!comment) {
        return yield* Effect.fail(new LeadNotFoundError());
      }

      return comment;
    }),

  listByDeal: (dealId: string, user: AuthenticatedUser) =>
    Effect.gen(function* () {
      const comments = yield* Effect.tryPromise({
        try: () => commentRepository.listByDeal(dealId, user),
        catch: (error) => error
      });

      if (!comments) {
        return yield* Effect.fail(new DealNotFoundError());
      }

      return comments;
    }),

  createForDeal: (dealId: string, input: CreateCommentDto, user: AuthenticatedUser) =>
    Effect.gen(function* () {
      const comment = yield* Effect.tryPromise({
        try: () => commentRepository.createForDeal(dealId, input, user),
        catch: (error) => error
      });

      if (!comment) {
        return yield* Effect.fail(new DealNotFoundError());
      }

      return comment;
    })
});

export type CommentService = ReturnType<typeof createCommentService>;
