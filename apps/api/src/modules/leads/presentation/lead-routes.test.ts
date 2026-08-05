import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";

import type { LeadDto } from "@kikos/shared";

import { buildServer } from "../../../app/server.js";
import type { UserRecord, UserRepository } from "../../users/application/user-repository.js";
import type { LeadRepository } from "../application/lead-repository.js";

const demoUser: UserRecord = {
  id: "0f890ef6-af84-43e2-a536-146776d22b62",
  name: "Administrador Kikos",
  email: "admin@kikos.local",
  passwordHash: bcrypt.hashSync("Admin123!", 4),
  role: "ADMIN"
};

const demoLead: LeadDto = {
  id: "f65fcce2-8488-4bea-9261-97fe3ee70b9b",
  name: "Carlos Almeida",
  email: "carlos.almeida@example.com",
  phone: "+55 11 98888-0001",
  company: "Academia Forma Total",
  source: "Site",
  dealsCount: 2,
  createdAt: "2026-08-05T12:00:00.000Z",
  updatedAt: "2026-08-05T12:00:00.000Z"
};

const userRepository: UserRepository = {
  findByEmail: (email) => Promise.resolve(email === demoUser.email ? demoUser : null),
  findById: (id) => Promise.resolve(id === demoUser.id ? demoUser : null),
  listSellers: () => Promise.resolve([])
};

const createLeadRepository = (): LeadRepository => ({
  list: (query) =>
    Promise.resolve({
      data: [demoLead],
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: 1,
        totalPages: 1
      }
    }),
  create: (input) =>
    Promise.resolve({
      ...demoLead,
      ...input,
      email: input.email ?? null,
      company: input.company ?? null,
      source: input.source ?? null,
      dealsCount: 0
    }),
  findById: (leadId) => Promise.resolve(leadId === demoLead.id ? demoLead : null),
  update: (leadId, input) => Promise.resolve(leadId === demoLead.id ? { ...demoLead, ...input } : null)
});

const buildAuthenticatedServer = async () => {
  const server = await buildServer({
    userRepository,
    leadRepository: createLeadRepository()
  });
  const token = server.jwt.sign({ sub: demoUser.id });

  return {
    server,
    authorization: `Bearer ${token}`
  };
};

describe("lead routes", () => {
  it("requires authentication", async () => {
    const server = await buildServer({
      userRepository,
      leadRepository: createLeadRepository()
    });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/leads"
    });

    expect(response.statusCode).toBe(401);
  });

  it("lists leads with pagination", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/leads?page=1&pageSize=20&search=carlos&sortBy=name&sortOrder=asc",
      headers: { authorization }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [demoLead],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1
      }
    });
  });

  it("creates a lead", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/leads",
      headers: { authorization },
      payload: {
        name: "Beatriz Lima",
        email: "beatriz.lima@example.com",
        phone: "+55 21 97777-0002",
        company: "Condominio Jardim Sul",
        source: "Indicacao"
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      lead: {
        name: "Beatriz Lima",
        email: "beatriz.lima@example.com",
        phone: "+55 21 97777-0002"
      }
    });
  });

  it("rejects invalid lead payload", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/leads",
      headers: { authorization },
      payload: {
        name: "",
        phone: "123"
      }
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      error: {
        code: "VALIDATION_ERROR"
      }
    });
  });

  it("returns a lead by id", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "GET",
      url: `/api/v1/leads/${demoLead.id}`,
      headers: { authorization }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ lead: demoLead });
  });

  it("returns 404 when the lead does not exist", async () => {
    const { server, authorization } = await buildAuthenticatedServer();

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/leads/8093d87d-312a-4302-9df9-813ecbd5f333",
      headers: { authorization }
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
});
