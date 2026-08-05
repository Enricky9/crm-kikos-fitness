import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import Fastify from "fastify";

import { createAuthService } from "../modules/auth/application/auth-service.js";
import { registerAuthRoutes } from "../modules/auth/presentation/auth-routes.js";
import type { UserRepository } from "../modules/users/application/user-repository.js";
import { createSequelizeUserRepository } from "../modules/users/infrastructure/sequelize-user-repository.js";
import { env } from "../shared/config/env.js";
import { registerErrorHandler } from "../shared/http/error-handler.js";

type BuildServerOptions = {
  readonly userRepository?: UserRepository;
};

export const buildServer = async (options: BuildServerOptions = {}) => {
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
  await server.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN
    }
  });

  registerErrorHandler(server);

  server.get("/health", () => ({
    status: "ok",
    service: "kikos-crm-api"
  }));

  const userRepository = options.userRepository ?? createSequelizeUserRepository();
  const authService = createAuthService(userRepository);

  await server.register(
    async (apiRoutes) => {
      await apiRoutes.register(registerAuthRoutes, {
        prefix: "/auth",
        authService
      });
    },
    { prefix: "/api/v1" }
  );

  return server;
};
