import { describe, expect, it } from "vitest";

import { buildServer } from "./server.js";

describe("health route", () => {
  it("returns service status", async () => {
    const server = await buildServer();

    const response = await server.inject({
      method: "GET",
      url: "/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      service: "kikos-crm-api"
    });
  });
});

describe("swagger docs", () => {
  it("exposes openapi json", async () => {
    const server = await buildServer();

    const response = await server.inject({
      method: "GET",
      url: "/api/docs/json"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      openapi: "3.0.3",
      info: {
        title: "Kikos Fitness CRM API"
      }
    });
  });
});
