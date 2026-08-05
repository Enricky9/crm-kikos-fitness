import rateLimit from "@fastify/rate-limit";
import type { FastifyPluginAsync } from "fastify";
import { Effect, Either } from "effect";
import { z } from "zod";

import { UnauthorizedError, ValidationError } from "../../../shared/errors/app-error.js";
import type { AuthService } from "../application/auth-service.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type JwtPayload = {
  readonly sub: string;
};

const getBearerToken = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError();
  }

  return authorizationHeader.slice("Bearer ".length);
};

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

      const loginResult = await Effect.runPromise(Effect.either(authService.login(parsedBody.data)));

      if (Either.isLeft(loginResult)) {
        throw loginResult.left;
      }

      const result = loginResult.right;
      const token = server.jwt.sign({ sub: result.user.id });

      return reply.send({
        token,
        user: result.user
      });
    });
  });

  server.get("/me", async (request, reply) => {
    const token = getBearerToken(request.headers.authorization);
    let payload: JwtPayload;

    try {
      payload = server.jwt.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedError();
    }

    const userResult = await Effect.runPromise(Effect.either(authService.getAuthenticatedUser(payload.sub)));

    if (Either.isLeft(userResult)) {
      throw userResult.left;
    }

    return reply.send({ user: userResult.right });
  });
};
