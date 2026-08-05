import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";

import { buildServer } from "../../../app/server.js";
import type { UserRecord, UserRepository } from "../../users/application/user-repository.js";

const demoUser: UserRecord = {
  id: "0f890ef6-af84-43e2-a536-146776d22b62",
  name: "Administrador Kikos",
  email: "admin@kikos.local",
  passwordHash: bcrypt.hashSync("Admin123!", 4),
  role: "ADMIN"
};

const userRepository: UserRepository = {
  findByEmail: (email) => Promise.resolve(email === demoUser.email ? demoUser : null),
  findById: (id) => Promise.resolve(id === demoUser.id ? demoUser : null)
};

describe("auth routes", () => {
  it("logs in with valid credentials", async () => {
    const server = await buildServer({ userRepository });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        email: "admin@kikos.local",
        password: "Admin123!"
      }
    });

    const body = response.json<{ token: string; user: Omit<UserRecord, "passwordHash"> }>();

    expect(response.statusCode).toBe(200);
    expect(body.token).toEqual(expect.any(String));
    expect(body.user).toEqual({
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      role: demoUser.role
    });
  });

  it("rejects invalid credentials", async () => {
    const server = await buildServer({ userRepository });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        email: "admin@kikos.local",
        password: "wrong-password"
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "E-mail ou senha invalidos",
        details: null
      }
    });
  });

  it("returns the authenticated user", async () => {
    const server = await buildServer({ userRepository });
    const token = server.jwt.sign({ sub: demoUser.id });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role
      }
    });
  });

  it("rejects missing bearer token", async () => {
    const server = await buildServer({ userRepository });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/auth/me"
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Autenticacao obrigatoria",
        details: null
      }
    });
  });
});
