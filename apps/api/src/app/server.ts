import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";

import { env } from "../shared/config/env.js";

export const buildServer = async () => {
  const server = Fastify({
    bodyLimit: 1_048_576,
    logger: {
      level: env.NODE_ENV === "test" ? "silent" : "info"
    }
  });

  await server.register(helmet);
  await server.register(cors, {
    origin: env.CORS_ORIGIN
  });

  server.get("/health", () => ({
    status: "ok",
    service: "kikos-crm-api"
  }));

  return server;
};
