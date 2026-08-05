import type { FastifyPluginCallback } from "fastify";
import { Effect, Either } from "effect";
import { z } from "zod";

import { createLeadSchema, leadListQuerySchema, updateLeadSchema } from "@kikos/shared";

import type { AuthService } from "../../auth/application/auth-service.js";
import { authenticateRequest } from "../../auth/presentation/authenticate-request.js";
import { ValidationError } from "../../../shared/errors/app-error.js";
import type { LeadService } from "../application/lead-service.js";

type LeadRoutesOptions = {
  readonly authService: AuthService;
  readonly leadService: LeadService;
};

const paramsSchema = z.object({
  leadId: z.string().uuid()
});

const runRouteEffect = async <A>(effect: Effect.Effect<A, unknown>) => {
  const result = await Effect.runPromise(Effect.either(effect));

  if (Either.isLeft(result)) {
    throw result.left;
  }

  return result.right;
};

export const registerLeadRoutes: FastifyPluginCallback<LeadRoutesOptions> = (
  server,
  { authService, leadService },
  done
) => {
  server.addHook("preHandler", async (request) => {
    await authenticateRequest(server, request, authService);
  });

  server.get("/", async (request, reply) => {
    const parsedQuery = leadListQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new ValidationError(parsedQuery.error.flatten());
    }

    const result = await runRouteEffect(leadService.list(parsedQuery.data));
    return reply.send(result);
  });

  server.post("/", async (request, reply) => {
    const parsedBody = createLeadSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new ValidationError(parsedBody.error.flatten());
    }

    const lead = await runRouteEffect(leadService.create(parsedBody.data));
    return reply.status(201).send({ lead });
  });

  server.get("/:leadId", async (request, reply) => {
    const parsedParams = paramsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new ValidationError(parsedParams.error.flatten());
    }

    const lead = await runRouteEffect(leadService.getById(parsedParams.data.leadId));
    return reply.send({ lead });
  });

  server.patch("/:leadId", async (request, reply) => {
    const parsedParams = paramsSchema.safeParse(request.params);
    const parsedBody = updateLeadSchema.safeParse(request.body);

    if (!parsedParams.success) {
      throw new ValidationError(parsedParams.error.flatten());
    }

    if (!parsedBody.success) {
      throw new ValidationError(parsedBody.error.flatten());
    }

    const lead = await runRouteEffect(leadService.update(parsedParams.data.leadId, parsedBody.data));
    return reply.send({ lead });
  });

  done();
};
