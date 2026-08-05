import { z } from "zod";

export const userRoleSchema = z.enum(["ADMIN", "SELLER"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const dealStatusSchema = z.enum(["NEW", "IN_PROGRESS", "PROPOSAL", "WON", "LOST"]);
export type DealStatus = z.infer<typeof dealStatusSchema>;

export const apiErrorCodeSchema = z.enum([
  "INVALID_CREDENTIALS",
  "UNAUTHORIZED",
  "LEAD_NOT_FOUND",
  "DEAL_NOT_FOUND",
  "SELLER_NOT_FOUND",
  "INVALID_DEAL_TRANSITION",
  "VALIDATION_ERROR",
  "CONFLICT",
  "INTERNAL_SERVER_ERROR"
]);
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export const apiErrorResponseSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
    details: z.unknown().nullable()
  })
});
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
