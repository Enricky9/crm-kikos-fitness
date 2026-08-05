import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";

import type { AuthenticatedUser, DealDetailsDto, DealDto } from "@kikos/shared";

import { DealNotFoundError, InvalidDealTransitionError } from "../../../shared/errors/app-error.js";
import type { DealListResult, DealRepository } from "./deal-repository.js";
import { createDealService } from "./deal-service.js";

const user: AuthenticatedUser = {
  id: "4da0c1ad-9931-4811-b4e4-d23eb9670289",
  name: "Vendedor Kikos",
  email: "seller@kikos.local",
  role: "SELLER"
};

const deal: DealDto = {
  id: "d2a96815-f1cc-4d50-b4b1-fc9260f48e25",
  title: "Esteiras profissionais",
  description: null,
  value: "48500.00",
  status: "WON",
  leadId: "f65fcce2-8488-4bea-9261-97fe3ee70b9b",
  sellerId: user.id,
  lostReason: null,
  closedAt: "2026-08-05T13:00:00.000Z",
  createdAt: "2026-08-05T12:00:00.000Z",
  updatedAt: "2026-08-05T13:00:00.000Z",
  lead: null,
  seller: {
    id: user.id,
    name: user.name,
    email: user.email
  }
};

const details: DealDetailsDto = {
  ...deal,
  comments: [],
  statusHistory: []
};

const listResult: DealListResult = {
  data: [deal],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 1,
    totalPages: 1
  }
};

const createRepository = (overrides: Partial<DealRepository> = {}): DealRepository => ({
  list: () => Promise.resolve(listResult),
  create: () => Promise.resolve(deal),
  findById: () => Promise.resolve(details),
  update: () => Promise.resolve(deal),
  findStatusById: () => Promise.resolve(deal),
  changeStatus: () => Promise.resolve(deal),
  win: () => Promise.resolve({ ...deal, status: "WON" }),
  lose: () => Promise.resolve({ ...deal, status: "LOST" }),
  reopen: () => Promise.resolve({ ...deal, status: "IN_PROGRESS", closedAt: null }),
  ...overrides
});

describe("deal service", () => {
  it("fails with DealNotFoundError when fetching a missing deal", async () => {
    const service = createDealService(createRepository({ findById: () => Promise.resolve(null) }));

    const result = await Effect.runPromise(Effect.either(service.getById(deal.id, user)));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left).toBeInstanceOf(DealNotFoundError);
    }
  });

  it("rejects invalid transition from won to in progress", async () => {
    const service = createDealService(createRepository());

    const result = await Effect.runPromise(
      Effect.either(service.changeStatus(deal.id, { status: "IN_PROGRESS" }, user))
    );

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left).toBeInstanceOf(InvalidDealTransitionError);
    }
  });

  it("reopens a closed deal", async () => {
    const service = createDealService(createRepository());

    const result = await Effect.runPromise(Effect.either(service.reopen(deal.id, user)));

    expect(Either.isRight(result)).toBe(true);
    if (Either.isRight(result)) {
      expect(result.right.status).toBe("IN_PROGRESS");
      expect(result.right.closedAt).toBeNull();
    }
  });
});
