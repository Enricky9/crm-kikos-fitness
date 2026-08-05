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
