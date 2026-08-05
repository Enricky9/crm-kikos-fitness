import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";

import type { CommentDto } from "@kikos/shared";

import { buildServer } from "../../../app/server.js";
import type { UserRepository, UserRecord } from "../../users/application/user-repository.js";
import type { CommentRepository } from "../application/comment-repository.js";

const demoUser: UserRecord = {
  id: "0f890ef6-af84-43e2-a536-146776d22b62",
  name: "Administrador Kikos",
  email: "admin@kikos.local",
  passwordHash: bcrypt.hashSync("Admin123!", 4),
  role: "ADMIN"
};

const leadId = "f65fcce2-8488-4bea-9261-97fe3ee70b9b";
const dealId = "d2a96815-f1cc-4d50-b4b1-fc9260f48e25";

const demoComment: CommentDto = {
  id: "b5547686-bcfd-4b9c-ad36-c2c2b9284684",
  content: "Cliente pediu retorno na sexta.",
  authorId: demoUser.id,
  leadId,
  dealId: null,
  createdAt: "2026-08-05T12:00:00.000Z",
  author: {
    id: demoUser.id,
    name: demoUser.name,
    email: demoUser.email
  }
};

const userRepository: UserRepository = {
  findByEmail: (email) => Promise.resolve(email === demoUser.email ? demoUser : null),
  findById: (id) => Promise.resolve(id === demoUser.id ? demoUser : null),
  listSellers: () => Promise.resolve([])
};

const commentRepository: CommentRepository = {
  listByLead: (requestedLeadId) => Promise.resolve(requestedLeadId === leadId ? [demoComment] : null),
  createForLead: (requestedLeadId, input, authorId) =>
    Promise.resolve(
      requestedLeadId === leadId
        ? {
            ...demoComment,
            content: input.content,
            authorId
          }
        : null
    ),
  listByDeal: (requestedDealId) =>
    Promise.resolve(requestedDealId === dealId ? [{ ...demoComment, leadId: null, dealId }] : null),
  createForDeal: (requestedDealId, input, user) =>
    Promise.resolve(
      requestedDealId === dealId
        ? {
            ...demoComment,
            content: input.content,
            authorId: user.id,
            leadId: null,
            dealId
          }
        : null
    )
};

const buildAuthenticatedServer = async () => {
  const server = await buildServer({
    userRepository,
    commentRepository
  });
  const token = server.jwt.sign({ sub: demoUser.id });

  return {
    server,
    authorization: `Bearer ${token}`
  };
};

describe("comment routes", () => {
  it("lists lead comments", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "GET",
      url: `/api/v1/leads/${leadId}/comments`,
      headers: { authorization }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ comments: [demoComment] });
  });

  it("creates lead comments", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "POST",
      url: `/api/v1/leads/${leadId}/comments`,
      headers: { authorization },
      payload: {
        content: "Enviar proposta revisada."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      comment: {
        content: "Enviar proposta revisada.",
        leadId
      }
    });
  });

  it("lists deal comments", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "GET",
      url: `/api/v1/deals/${dealId}/comments`,
      headers: { authorization }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      comments: [
        {
          dealId
        }
      ]
    });
  });

  it("rejects empty comments", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "POST",
      url: `/api/v1/deals/${dealId}/comments`,
      headers: { authorization },
      payload: {
        content: ""
      }
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      error: {
        code: "VALIDATION_ERROR"
      }
    });
  });
});
