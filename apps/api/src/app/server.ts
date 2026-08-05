import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";

export const buildServer = async () => {
  const server = Fastify({
    bodyLimit: 1_048_576,
    logger: {
      level: process.env.NODE_ENV === "test" ? "silent" : "info"
    }
  });

  await server.register(helmet);
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173"
  });

  server.get("/health", () => ({
    status: "ok",
    service: "kikos-crm-api"
  }));

  return server;
};
