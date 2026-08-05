import type { FastifyPluginCallback } from "fastify";

import type { AuthService } from "../../auth/application/auth-service.js";
import { authenticateRequest } from "../../auth/presentation/authenticate-request.js";
import type { UserRepository } from "../application/user-repository.js";

type SellerRoutesOptions = {
  readonly authService: AuthService;
  readonly userRepository: UserRepository;
};

export const registerSellerRoutes: FastifyPluginCallback<SellerRoutesOptions> = (
  server,
  { authService, userRepository },
  done
) => {
  server.addHook("preHandler", async (request) => {
    await authenticateRequest(server, request, authService);
  });

  server.get("/", async (_request, reply) => {
    const sellers = await userRepository.listSellers();
    return reply.send({ sellers });
  });

  done();
};
