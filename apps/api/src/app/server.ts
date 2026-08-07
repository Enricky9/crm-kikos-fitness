import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import Fastify from "fastify";

import { createAuthService } from "../modules/auth/application/auth-service.js";
import { registerAuthRoutes } from "../modules/auth/presentation/auth-routes.js";
import { createCommentService } from "../modules/comments/application/comment-service.js";
import type { CommentRepository } from "../modules/comments/application/ports/comment-repository.js";
import { createSequelizeCommentRepository } from "../modules/comments/infrastructure/persistence/sequelize/sequelize-comment-repository.js";
import { registerCommentRoutes } from "../modules/comments/presentation/comment-routes.js";
import type { DealRepository } from "../modules/deals/application/ports/deal-repository.js";
import { createDealService } from "../modules/deals/application/deal-service.js";
import { createSequelizeDealRepository } from "../modules/deals/infrastructure/persistence/sequelize/sequelize-deal-repository.js";
import { registerDealRoutes } from "../modules/deals/presentation/deal-routes.js";
import { createLeadService } from "../modules/leads/application/lead-service.js";
import type { LeadRepository } from "../modules/leads/application/ports/lead-repository.js";
import { createSequelizeLeadRepository } from "../modules/leads/infrastructure/persistence/sequelize/sequelize-lead-repository.js";
import { registerLeadRoutes } from "../modules/leads/presentation/lead-routes.js";
import type { UserRepository } from "../modules/users/application/ports/user-repository.js";
import { createSequelizeUserRepository } from "../modules/users/infrastructure/persistence/sequelize/sequelize-user-repository.js";
import { registerSellerRoutes } from "../modules/users/presentation/seller-routes.js";
import { env } from "../shared/config/env.js";
import { registerErrorHandler } from "../shared/http/error-handler.js";
import { registerSwagger } from "./plugins/swagger.js";

type BuildServerOptions = {
  readonly userRepository?: UserRepository;
  readonly leadRepository?: LeadRepository;
  readonly dealRepository?: DealRepository;
  readonly commentRepository?: CommentRepository;
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
  await registerSwagger(server);

  server.get("/health", () => ({
    status: "ok",
    service: "kikos-crm-api"
  }));

  const userRepository = options.userRepository ?? createSequelizeUserRepository();
  const leadRepository = options.leadRepository ?? createSequelizeLeadRepository();
  const dealRepository = options.dealRepository ?? createSequelizeDealRepository();
  const commentRepository = options.commentRepository ?? createSequelizeCommentRepository();
  const authService = createAuthService(userRepository);
  const leadService = createLeadService(leadRepository);
  const dealService = createDealService(dealRepository);
  const commentService = createCommentService(commentRepository);

  await server.register(
    async (apiRoutes) => {
      await apiRoutes.register(registerAuthRoutes, {
        prefix: "/auth",
        authService
      });
      await apiRoutes.register(registerLeadRoutes, {
        prefix: "/leads",
        authService,
        leadService
      });
      await apiRoutes.register(registerCommentRoutes, {
        prefix: "/leads/:leadId/comments",
        authService,
        commentService,
        target: "lead"
      });
      await apiRoutes.register(registerDealRoutes, {
        prefix: "/deals",
        authService,
        dealService
      });
      await apiRoutes.register(registerCommentRoutes, {
        prefix: "/deals/:dealId/comments",
        authService,
        commentService,
        target: "deal"
      });
      await apiRoutes.register(registerSellerRoutes, {
        prefix: "/sellers",
        authService,
        userRepository
      });
    },
    { prefix: "/api/v1" }
  );

  return server;
};
