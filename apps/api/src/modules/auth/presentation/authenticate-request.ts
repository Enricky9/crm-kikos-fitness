import type { FastifyInstance, FastifyRequest } from "fastify";
import { Effect, Either } from "effect";

import type { AuthenticatedUser } from "@kikos/shared";

import { UnauthorizedError } from "../../../shared/errors/app-error.js";
import type { AuthService } from "../application/auth-service.js";

type JwtPayload = {
  readonly sub: string;
};

const getBearerToken = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError();
  }

  return authorizationHeader.slice("Bearer ".length);
};

export const authenticateRequest = async (
  server: FastifyInstance,
  request: FastifyRequest,
  authService: AuthService
): Promise<AuthenticatedUser> => {
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

  return userResult.right;
};
