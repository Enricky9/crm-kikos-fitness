import type { ApiErrorCode } from "@kikos/shared";

export class AppError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly statusCode: number,
    readonly details: unknown = null
  ) {
    super(message);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super("INVALID_CREDENTIALS", "E-mail ou senha invalidos", 401);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("UNAUTHORIZED", "Autenticacao obrigatoria", 401);
  }
}

export class LeadNotFoundError extends AppError {
  constructor() {
    super("LEAD_NOT_FOUND", "Lead nao encontrado", 404);
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown = null) {
    super("VALIDATION_ERROR", "Dados invalidos", 422, details);
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;
