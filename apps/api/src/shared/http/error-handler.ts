import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

import { isAppError } from "../errors/app-error.js";

export const registerErrorHandler = (server: FastifyInstance) => {
  server.setErrorHandler((error, _request, reply) => {
    if (isAppError(error)) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      });
    }

    if (error instanceof ZodError) {
      return reply.status(422).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Dados invalidos",
          details: error.flatten()
        }
      });
    }

    server.log.error(error);

    return reply.status(500).send({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno do servidor",
        details: null
      }
    });
  });
};
