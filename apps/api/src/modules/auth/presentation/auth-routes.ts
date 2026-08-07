import rateLimit from "@fastify/rate-limit";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { ValidationError } from "../../../shared/errors/app-error.js";
import { runRouteEffect } from "../../../shared/http/run-route-effect.js";
import type { AuthService } from "../application/auth-service.js";
import { authenticateRequest } from "./authenticate-request.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type AuthRoutesOptions = {
  readonly authService: AuthService;
};

export const registerAuthRoutes: FastifyPluginAsync<AuthRoutesOptions> = async (
  server,
  { authService }
) => {
  await server.register(async (authRoutes) => {
    await authRoutes.register(rateLimit, {
      max: 5,
      timeWindow: "1 minute"
    });

    authRoutes.post("/login", async (request, reply) => {
      const parsedBody = loginSchema.safeParse(request.body);

      if (!parsedBody.success) {
        throw new ValidationError(parsedBody.error.flatten());
      }

      const result = await runRouteEffect(authService.login(parsedBody.data));
      const token = server.jwt.sign({ sub: result.user.id });

      return reply.send({
        token,
        user: result.user
      });
    });
  });

  server.get("/me", async (request, reply) => {
    const user = await authenticateRequest(server, request, authService);

    return reply.send({ user });
  });
};
