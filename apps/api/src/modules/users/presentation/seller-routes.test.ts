import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";

import { buildServer } from "../../../app/server.js";
import type { UserRepository, UserRecord } from "../application/ports/user-repository.js";

const demoUser: UserRecord = {
  id: "0f890ef6-af84-43e2-a536-146776d22b62",
  name: "Administrador Kikos",
  email: "admin@kikos.local",
  passwordHash: bcrypt.hashSync("Admin123!", 4),
  role: "ADMIN"
};

const seller = {
  id: "4da0c1ad-9931-4811-b4e4-d23eb9670289",
  name: "Vendedor Kikos",
  email: "seller@kikos.local",
  role: "SELLER" as const
};

const userRepository: UserRepository = {
  findByEmail: (email) => Promise.resolve(email === demoUser.email ? demoUser : null),
  findById: (id) => Promise.resolve(id === demoUser.id ? demoUser : null),
  listSellers: () => Promise.resolve([seller])
};

describe("seller routes", () => {
  it("lists sellers for authenticated users", async () => {
    const server = await buildServer({ userRepository });
    const token = server.jwt.sign({ sub: demoUser.id });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/sellers",
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ sellers: [seller] });
  });
});
