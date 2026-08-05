import { Effect } from "effect";

import type {
  AuthenticatedUser,
  ChangeDealStatusDto,
  CreateDealDto,
  DealListQuery,
  LoseDealDto,
  UpdateDealDto
} from "@kikos/shared";

import { DealNotFoundError, InvalidDealTransitionError } from "../../../shared/errors/app-error.js";
import { canTransitionDeal, isClosedDealStatus } from "../domain/deal-transitions.js";
import type { DealRepository } from "./deal-repository.js";

export const createDealService = (dealRepository: DealRepository) => ({
  list: (query: DealListQuery, user: AuthenticatedUser) =>
    Effect.tryPromise({
      try: () => dealRepository.list(query, user),
      catch: (error) => error
    }),

  create: (input: CreateDealDto, changedBy: string) =>
    Effect.tryPromise({
      try: () => dealRepository.create(input, changedBy),
      catch: (error) => error
    }),

  getById: (dealId: string, user: AuthenticatedUser) =>
    Effect.gen(function* () {
      const deal = yield* Effect.tryPromise({
        try: () => dealRepository.findById(dealId, user),
        catch: (error) => error
      });

      if (!deal) {
        return yield* Effect.fail(new DealNotFoundError());
      }

      return deal;
    }),

  update: (dealId: string, input: UpdateDealDto, user: AuthenticatedUser) =>
    Effect.gen(function* () {
      const deal = yield* Effect.tryPromise({
        try: () => dealRepository.update(dealId, input, user),
        catch: (error) => error
      });

      if (!deal) {
        return yield* Effect.fail(new DealNotFoundError());
      }

      return deal;
    }),

  changeStatus: (dealId: string, input: ChangeDealStatusDto, user: AuthenticatedUser) =>
    Effect.gen(function* () {
      const deal = yield* Effect.tryPromise({
        try: () => dealRepository.findStatusById(dealId, user),
        catch: (error) => error
      });

      if (!deal) {
        return yield* Effect.fail(new DealNotFoundError());
      }

      if (!canTransitionDeal(deal.status, input.status)) {
        return yield* Effect.fail(new InvalidDealTransitionError());
      }

      const updatedDeal = yield* Effect.tryPromise({
        try: () => dealRepository.changeStatus(dealId, input, user),
        catch: (error) => error
      });

      if (!updatedDeal) {
        return yield* Effect.fail(new DealNotFoundError());
      }

      return updatedDeal;
    }),

  win: (dealId: string, user: AuthenticatedUser) =>
    Effect.gen(function* () {
      const deal = yield* Effect.tryPromise({
        try: () => dealRepository.findStatusById(dealId, user),
        catch: (error) => error
      });

      if (!deal) {
        return yield* Effect.fail(new DealNotFoundError());
      }

      if (!canTransitionDeal(deal.status, "WON")) {
        return yield* Effect.fail(new InvalidDealTransitionError());
      }

      const updatedDeal = yield* Effect.tryPromise({
        try: () => dealRepository.win(dealId, user),
        catch: (error) => error
      });

      if (!updatedDeal) {
        return yield* Effect.fail(new DealNotFoundError());
      }

      return updatedDeal;
    }),

  lose: (dealId: string, input: LoseDealDto, user: AuthenticatedUser) =>
    Effect.gen(function* () {
      const deal = yield* Effect.tryPromise({
        try: () => dealRepository.findStatusById(dealId, user),
        catch: (error) => error
      });

      if (!deal) {
        return yield* Effect.fail(new DealNotFoundError());
      }

      if (!canTransitionDeal(deal.status, "LOST")) {
        return yield* Effect.fail(new InvalidDealTransitionError());
      }

      const updatedDeal = yield* Effect.tryPromise({
        try: () => dealRepository.lose(dealId, input, user),
        catch: (error) => error
      });

      if (!updatedDeal) {
        return yield* Effect.fail(new DealNotFoundError());
      }

      return updatedDeal;
    }),

  reopen: (dealId: string, user: AuthenticatedUser) =>
    Effect.gen(function* () {
      const deal = yield* Effect.tryPromise({
        try: () => dealRepository.findStatusById(dealId, user),
        catch: (error) => error
      });

      if (!deal) {
        return yield* Effect.fail(new DealNotFoundError());
      }

      if (!isClosedDealStatus(deal.status)) {
        return yield* Effect.fail(new InvalidDealTransitionError());
      }

      const updatedDeal = yield* Effect.tryPromise({
        try: () => dealRepository.reopen(dealId, user),
        catch: (error) => error
      });

      if (!updatedDeal) {
        return yield* Effect.fail(new DealNotFoundError());
      }

      return updatedDeal;
    })
});

export type DealService = ReturnType<typeof createDealService>;
