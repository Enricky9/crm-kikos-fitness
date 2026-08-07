import type { FastifyPluginCallback } from "fastify";
import { z } from "zod";

import { changeDealStatusSchema, createDealSchema, dealListQuerySchema, loseDealSchema, updateDealSchema } from "@kikos/shared";

import type { AuthService } from "../../auth/application/auth-service.js";
import { authenticateRequest } from "../../auth/presentation/authenticate-request.js";
import { ValidationError } from "../../../shared/errors/app-error.js";
import { runRouteEffect } from "../../../shared/http/run-route-effect.js";
import type { DealService } from "../application/deal-service.js";

type DealRoutesOptions = {
  readonly authService: AuthService;
  readonly dealService: DealService;
};

const paramsSchema = z.object({
  dealId: z.string().uuid()
});

export const registerDealRoutes: FastifyPluginCallback<DealRoutesOptions> = (
  server,
  { authService, dealService },
  done
) => {
  server.addHook("preHandler", async (request) => {
    await authenticateRequest(server, request, authService);
  });

  server.get("/", async (request, reply) => {
    const user = await authenticateRequest(server, request, authService);
    const parsedQuery = dealListQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new ValidationError(parsedQuery.error.flatten());
    }

    const result = await runRouteEffect(dealService.list(parsedQuery.data, user));
    return reply.send(result);
  });

  server.post("/", async (request, reply) => {
    const user = await authenticateRequest(server, request, authService);
    const parsedBody = createDealSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new ValidationError(parsedBody.error.flatten());
    }

    const deal = await runRouteEffect(dealService.create(parsedBody.data, user.id));
    return reply.status(201).send({ deal });
  });

  server.get("/:dealId", async (request, reply) => {
    const user = await authenticateRequest(server, request, authService);
    const parsedParams = paramsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new ValidationError(parsedParams.error.flatten());
    }

    const deal = await runRouteEffect(dealService.getById(parsedParams.data.dealId, user));
    return reply.send({ deal });
  });

  server.patch("/:dealId", async (request, reply) => {
    const user = await authenticateRequest(server, request, authService);
    const parsedParams = paramsSchema.safeParse(request.params);
    const parsedBody = updateDealSchema.safeParse(request.body);

    if (!parsedParams.success) {
      throw new ValidationError(parsedParams.error.flatten());
    }

    if (!parsedBody.success) {
      throw new ValidationError(parsedBody.error.flatten());
    }

    const deal = await runRouteEffect(dealService.update(parsedParams.data.dealId, parsedBody.data, user));
    return reply.send({ deal });
  });

  server.patch("/:dealId/status", async (request, reply) => {
    const user = await authenticateRequest(server, request, authService);
    const parsedParams = paramsSchema.safeParse(request.params);
    const parsedBody = changeDealStatusSchema.safeParse(request.body);

    if (!parsedParams.success) {
      throw new ValidationError(parsedParams.error.flatten());
    }

    if (!parsedBody.success) {
      throw new ValidationError(parsedBody.error.flatten());
    }

    const deal = await runRouteEffect(
      dealService.changeStatus(parsedParams.data.dealId, parsedBody.data, user)
    );
    return reply.send({ deal });
  });

  server.post("/:dealId/win", async (request, reply) => {
    const user = await authenticateRequest(server, request, authService);
    const parsedParams = paramsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new ValidationError(parsedParams.error.flatten());
    }

    const deal = await runRouteEffect(dealService.win(parsedParams.data.dealId, user));
    return reply.send({ deal });
  });

  server.post("/:dealId/lose", async (request, reply) => {
    const user = await authenticateRequest(server, request, authService);
    const parsedParams = paramsSchema.safeParse(request.params);
    const parsedBody = loseDealSchema.safeParse(request.body ?? {});

    if (!parsedParams.success) {
      throw new ValidationError(parsedParams.error.flatten());
    }

    if (!parsedBody.success) {
      throw new ValidationError(parsedBody.error.flatten());
    }

    const deal = await runRouteEffect(dealService.lose(parsedParams.data.dealId, parsedBody.data, user));
    return reply.send({ deal });
  });

  server.post("/:dealId/reopen", async (request, reply) => {
    const user = await authenticateRequest(server, request, authService);
    const parsedParams = paramsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new ValidationError(parsedParams.error.flatten());
    }

    const deal = await runRouteEffect(dealService.reopen(parsedParams.data.dealId, user));
    return reply.send({ deal });
  });

  done();
};
