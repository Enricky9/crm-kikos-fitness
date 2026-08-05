import type { FastifyPluginCallback } from "fastify";
import { Effect, Either } from "effect";
import { z } from "zod";

import { createCommentSchema } from "@kikos/shared";

import type { AuthService } from "../../auth/application/auth-service.js";
import { authenticateRequest } from "../../auth/presentation/authenticate-request.js";
import { ValidationError } from "../../../shared/errors/app-error.js";
import type { CommentService } from "../application/comment-service.js";

type CommentRoutesOptions = {
  readonly authService: AuthService;
  readonly commentService: CommentService;
  readonly target: "lead" | "deal";
};

const leadParamsSchema = z.object({
  leadId: z.string().uuid()
});

const dealParamsSchema = z.object({
  dealId: z.string().uuid()
});

const runRouteEffect = async <A>(effect: Effect.Effect<A, unknown>) => {
  const result = await Effect.runPromise(Effect.either(effect));

  if (Either.isLeft(result)) {
    throw result.left;
  }

  return result.right;
};

export const registerCommentRoutes: FastifyPluginCallback<CommentRoutesOptions> = (
  server,
  { authService, commentService, target },
  done
) => {
  server.addHook("preHandler", async (request) => {
    await authenticateRequest(server, request, authService);
  });

  server.get("/", async (request, reply) => {
    const user = await authenticateRequest(server, request, authService);

    if (target === "lead") {
      const parsedParams = leadParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        throw new ValidationError(parsedParams.error.flatten());
      }

      const comments = await runRouteEffect(commentService.listByLead(parsedParams.data.leadId));
      return reply.send({ comments });
    }

    const parsedParams = dealParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new ValidationError(parsedParams.error.flatten());
    }

    const comments = await runRouteEffect(commentService.listByDeal(parsedParams.data.dealId, user));
    return reply.send({ comments });
  });

  server.post("/", async (request, reply) => {
    const user = await authenticateRequest(server, request, authService);
    const parsedBody = createCommentSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new ValidationError(parsedBody.error.flatten());
    }

    if (target === "lead") {
      const parsedParams = leadParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        throw new ValidationError(parsedParams.error.flatten());
      }

      const comment = await runRouteEffect(
        commentService.createForLead(parsedParams.data.leadId, parsedBody.data, user.id)
      );
      return reply.status(201).send({ comment });
    }

    const parsedParams = dealParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new ValidationError(parsedParams.error.flatten());
    }

    const comment = await runRouteEffect(
      commentService.createForDeal(parsedParams.data.dealId, parsedBody.data, user)
    );
    return reply.status(201).send({ comment });
  });

  done();
};
