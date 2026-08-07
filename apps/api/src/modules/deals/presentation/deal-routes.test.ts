import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";

import { dealAiSummarySchema, type AuthenticatedUser, type CommentDto, type DealDto, type DealStatus } from "@kikos/shared";
import { z } from "zod";

import { buildServer } from "../../../app/server.js";
import { LeadNotFoundError, SellerNotFoundError } from "../../../shared/errors/app-error.js";
import type { UserRecord, UserRepository } from "../../users/application/ports/user-repository.js";
import type { DealListResult, DealRepository } from "../application/ports/deal-repository.js";
import type { DealSummaryProvider } from "../application/ports/deal-summary-provider.js";

const adminUser: UserRecord = {
  id: "0f890ef6-af84-43e2-a536-146776d22b62",
  name: "Administrador Kikos",
  email: "admin@kikos.local",
  passwordHash: bcrypt.hashSync("Admin123!", 4),
  role: "ADMIN"
};

const sellerUser: UserRecord = {
  id: "4da0c1ad-9931-4811-b4e4-d23eb9670289",
  name: "Vendedor Kikos",
  email: "seller@kikos.local",
  passwordHash: bcrypt.hashSync("Seller123!", 4),
  role: "SELLER"
};

const demoDeal: DealDto = {
  id: "d2a96815-f1cc-4d50-b4b1-fc9260f48e25",
  title: "Esteiras profissionais",
  description: "Renovacao de cardio.",
  value: "48500.00",
  status: "IN_PROGRESS",
  leadId: "f65fcce2-8488-4bea-9261-97fe3ee70b9b",
  sellerId: sellerUser.id,
  lostReason: null,
  closedAt: null,
  createdAt: "2026-08-05T12:00:00.000Z",
  updatedAt: "2026-08-05T12:00:00.000Z",
  lead: {
    id: "f65fcce2-8488-4bea-9261-97fe3ee70b9b",
    name: "Carlos Almeida",
    company: "Academia Forma Total"
  },
  seller: {
    id: sellerUser.id,
    name: sellerUser.name,
    email: sellerUser.email
  }
};

const demoComment: CommentDto = {
  id: "a45f9da6-43b1-4e2a-86eb-31ed5d7c07f0",
  content: "Cliente pediu uma proposta revisada com prazo de entrega.",
  authorId: sellerUser.id,
  leadId: null,
  dealId: demoDeal.id,
  createdAt: "2026-08-05T12:30:00.000Z",
  author: {
    id: sellerUser.id,
    name: sellerUser.name,
    email: sellerUser.email
  }
};

const createUserRepository = (currentUser: UserRecord = adminUser): UserRepository => ({
  findByEmail: (email) => Promise.resolve(email === currentUser.email ? currentUser : null),
  findById: (id) => Promise.resolve(id === currentUser.id ? currentUser : null),
  listSellers: () =>
    Promise.resolve([
      {
        id: sellerUser.id,
        name: sellerUser.name,
        email: sellerUser.email,
        role: sellerUser.role
      }
    ])
});

const withStatus = (status: DealStatus): DealDto => ({
  ...demoDeal,
  status,
  closedAt: status === "WON" || status === "LOST" ? "2026-08-05T13:00:00.000Z" : null
});

const createDealRepository = (initialDeal: DealDto = demoDeal): DealRepository => ({
  list: (query, user): Promise<DealListResult> =>
    Promise.resolve({
      data: user.role === "SELLER" && user.id !== initialDeal.sellerId ? [] : [initialDeal],
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: 1,
        totalPages: 1
      }
    }),
  create: (input, changedBy) =>
    Promise.resolve({
      ...demoDeal,
      ...input,
      value: input.value.toFixed(2),
      status: input.status,
      sellerId: input.sellerId,
      leadId: input.leadId,
      description: input.description ?? null,
      lostReason: null,
      closedAt: null,
      seller: {
        id: changedBy,
        name: adminUser.name,
        email: adminUser.email
      }
    }),
  findById: (dealId, user) =>
    Promise.resolve(
      dealId === initialDeal.id && canUserSeeDeal(user, initialDeal)
        ? { ...initialDeal, comments: [demoComment], statusHistory: [] }
        : null
    ),
  update: (dealId, input, user) =>
    Promise.resolve(
      dealId === initialDeal.id && canUserSeeDeal(user, initialDeal)
        ? {
            ...initialDeal,
            ...input,
            value: input.value?.toFixed(2) ?? initialDeal.value,
            description: input.description ?? initialDeal.description
          }
        : null
    ),
  findStatusById: (dealId, user) =>
    Promise.resolve(dealId === initialDeal.id && canUserSeeDeal(user, initialDeal) ? initialDeal : null),
  changeStatus: (dealId, input, user) =>
    Promise.resolve(
      dealId === initialDeal.id && canUserSeeDeal(user, initialDeal) ? withStatus(input.status) : null
    ),
  win: (dealId, user) =>
    Promise.resolve(dealId === initialDeal.id && canUserSeeDeal(user, initialDeal) ? withStatus("WON") : null),
  lose: (dealId, input, user) =>
    Promise.resolve(
      dealId === initialDeal.id && canUserSeeDeal(user, initialDeal)
        ? { ...withStatus("LOST"), lostReason: input.reason ?? null }
        : null
    ),
  reopen: (dealId, user) =>
    Promise.resolve(
      dealId === initialDeal.id && canUserSeeDeal(user, initialDeal) ? withStatus("IN_PROGRESS") : null
    )
});

const createDealRepositoryWithCreateError = (error: Error): DealRepository => ({
  ...createDealRepository(),
  create: () => Promise.reject(error)
});

const canUserSeeDeal = (user: AuthenticatedUser, deal: DealDto) =>
  user.role === "ADMIN" || user.id === deal.sellerId;

const createSummaryProvider = (): DealSummaryProvider => ({
  summarize: ({ comments }) =>
    Promise.resolve({
      provider: "mock",
      summary: `Resumo gerado para ${comments.length} comentario(s).`
    })
});

const createFailingSummaryProvider = (): DealSummaryProvider => ({
  summarize: () => Promise.reject(new Error("AI provider unavailable"))
});

const buildAuthenticatedServer = async (
  currentUser: UserRecord = adminUser,
  dealRepository: DealRepository = createDealRepository(),
  dealSummaryProvider: DealSummaryProvider = createSummaryProvider()
) => {
  const server = await buildServer({
    userRepository: createUserRepository(currentUser),
    dealRepository,
    dealSummaryProvider
  });
  const token = server.jwt.sign({ sub: currentUser.id });

  return {
    server,
    authorization: `Bearer ${token}`
  };
};

describe("deal routes", () => {
  it("lists deals for an authenticated user", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/deals?page=1&pageSize=20&status=IN_PROGRESS",
      headers: { authorization }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [demoDeal],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 }
    });
  });

  it("creates a deal", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/deals",
      headers: { authorization },
      payload: {
        title: "Nova sala cardio",
        value: 12000,
        status: "NEW",
        leadId: demoDeal.leadId,
        sellerId: sellerUser.id
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      deal: {
        title: "Nova sala cardio",
        value: "12000.00",
        status: "NEW"
      }
    });
  });

  it("rejects deal creation when lead does not exist", async () => {
    const { server, authorization } = await buildAuthenticatedServer(
      undefined,
      createDealRepositoryWithCreateError(new LeadNotFoundError())
    );

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/deals",
      headers: { authorization },
      payload: {
        title: "Nova sala cardio",
        value: 12000,
        status: "NEW",
        leadId: demoDeal.leadId,
        sellerId: sellerUser.id
      }
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "LEAD_NOT_FOUND",
        message: "Lead nao encontrado",
        details: null
      }
    });
  });

  it("rejects deal creation when seller does not exist", async () => {
    const { server, authorization } = await buildAuthenticatedServer(
      undefined,
      createDealRepositoryWithCreateError(new SellerNotFoundError())
    );

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/deals",
      headers: { authorization },
      payload: {
        title: "Nova sala cardio",
        value: 12000,
        status: "NEW",
        leadId: demoDeal.leadId,
        sellerId: sellerUser.id
      }
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "SELLER_NOT_FOUND",
        message: "Vendedor nao encontrado",
        details: null
      }
    });
  });

  it("returns deal details with comments and status history", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "GET",
      url: `/api/v1/deals/${demoDeal.id}`,
      headers: { authorization }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      deal: {
        ...demoDeal,
        comments: [demoComment],
        statusHistory: []
      }
    });
  });

  it("generates an AI summary for a deal", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "POST",
      url: `/api/v1/deals/${demoDeal.id}/ai-summary`,
      headers: { authorization }
    });

    expect(response.statusCode).toBe(200);
    const body: unknown = response.json();
    const parsedBody = z.object({ summary: dealAiSummarySchema }).parse(body);

    expect(parsedBody).toMatchObject({
      summary: {
        provider: "mock",
        summary: "Resumo gerado para 1 comentario(s)."
      }
    });
  });

  it("returns not found when generating a summary for a hidden deal", async () => {
    const otherSeller: UserRecord = {
      ...sellerUser,
      id: "227d6eb3-f68a-40df-90e9-e83cf3a2ee5d",
      email: "other.seller@kikos.local"
    };
    const { server, authorization } = await buildAuthenticatedServer(otherSeller);

    const response = await server.inject({
      method: "POST",
      url: `/api/v1/deals/${demoDeal.id}/ai-summary`,
      headers: { authorization }
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: {
        code: "DEAL_NOT_FOUND"
      }
    });
  });

  it("returns a controlled error when AI summary generation fails", async () => {
    const { server, authorization } = await buildAuthenticatedServer(
      adminUser,
      createDealRepository(),
      createFailingSummaryProvider()
    );

    const response = await server.inject({
      method: "POST",
      url: `/api/v1/deals/${demoDeal.id}/ai-summary`,
      headers: { authorization }
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: {
        code: "AI_SUMMARY_UNAVAILABLE",
        message: "Nao foi possivel gerar o resumo com IA",
        details: null
      }
    });
  });

  it("changes status when transition is valid", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "PATCH",
      url: `/api/v1/deals/${demoDeal.id}/status`,
      headers: { authorization },
      payload: {
        status: "PROPOSAL"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      deal: {
        status: "PROPOSAL"
      }
    });
  });

  it("rejects invalid status transition", async () => {
    const { server, authorization } = await buildAuthenticatedServer(undefined, createDealRepository(withStatus("WON")));

    const response = await server.inject({
      method: "PATCH",
      url: `/api/v1/deals/${demoDeal.id}/status`,
      headers: { authorization },
      payload: {
        status: "IN_PROGRESS"
      }
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toEqual({
      error: {
        code: "INVALID_DEAL_TRANSITION",
        message: "Transicao de status invalida",
        details: null
      }
    });
  });

  it("marks a deal as lost with a reason", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "POST",
      url: `/api/v1/deals/${demoDeal.id}/lose`,
      headers: { authorization },
      payload: {
        reason: "Cliente adiou investimento"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      deal: {
        status: "LOST",
        lostReason: "Cliente adiou investimento"
      }
    });
  });

  it("marks a deal as won", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "POST",
      url: `/api/v1/deals/${demoDeal.id}/win`,
      headers: { authorization }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      deal: {
        status: "WON"
      }
    });
  });

  it("reopens a closed deal", async () => {
    const { server, authorization } = await buildAuthenticatedServer(undefined, createDealRepository(withStatus("LOST")));

    const response = await server.inject({
      method: "POST",
      url: `/api/v1/deals/${demoDeal.id}/reopen`,
      headers: { authorization }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      deal: {
        status: "IN_PROGRESS",
        closedAt: null
      }
    });
  });

  it("rejects reopening an open deal", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "POST",
      url: `/api/v1/deals/${demoDeal.id}/reopen`,
      headers: { authorization }
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      error: {
        code: "INVALID_DEAL_TRANSITION"
      }
    });
  });

  it("hides deals assigned to another seller", async () => {
    const otherSeller: UserRecord = {
      ...sellerUser,
      id: "227d6eb3-f68a-40df-90e9-e83cf3a2ee5d",
      email: "other.seller@kikos.local"
    };
    const { server, authorization } = await buildAuthenticatedServer(otherSeller);

    const response = await server.inject({
      method: "GET",
      url: `/api/v1/deals/${demoDeal.id}`,
      headers: { authorization }
    });

    expect(response.statusCode).toBe(404);
  });
});
