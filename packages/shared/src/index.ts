import { z } from "zod";

export const userRoleSchema = z.enum(["ADMIN", "SELLER"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const dealStatusSchema = z.enum(["NEW", "IN_PROGRESS", "PROPOSAL", "WON", "LOST"]);
export type DealStatus = z.infer<typeof dealStatusSchema>;

export const openDealStatusSchema = z.enum(["NEW", "IN_PROGRESS", "PROPOSAL"]);
export type OpenDealStatus = z.infer<typeof openDealStatusSchema>;

export const dealStatusLabels: Record<DealStatus, string> = {
  NEW: "Novo",
  IN_PROGRESS: "Em andamento",
  PROPOSAL: "Proposta",
  WON: "Ganho",
  LOST: "Perdido"
};

export const apiErrorCodeSchema = z.enum([
  "INVALID_CREDENTIALS",
  "UNAUTHORIZED",
  "FORBIDDEN",
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

export const authenticatedUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema
});
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

export const leadSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string(),
  company: z.string().nullable(),
  source: z.string().nullable(),
  dealsCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string()
});
export type LeadDto = z.infer<typeof leadSchema>;

export const createLeadSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().min(8),
  company: z.string().trim().min(1).optional().nullable(),
  source: z.string().trim().min(1).optional().nullable()
});
export type CreateLeadDto = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = createLeadSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "Informe ao menos um campo para atualizar"
});
export type UpdateLeadDto = z.infer<typeof updateLeadSchema>;

export const leadListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});
export type LeadListQuery = z.infer<typeof leadListQuerySchema>;

export const paginatedLeadsSchema = z.object({
  data: z.array(leadSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative()
  })
});
export type PaginatedLeadsDto = z.infer<typeof paginatedLeadsSchema>;

export const sellerSchema = authenticatedUserSchema.pick({
  id: true,
  name: true,
  email: true
});
export type SellerDto = z.infer<typeof sellerSchema>;

export const dealSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  value: z.string(),
  status: dealStatusSchema,
  leadId: z.string().uuid(),
  sellerId: z.string().uuid(),
  lostReason: z.string().nullable(),
  closedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lead: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      company: z.string().nullable()
    })
    .nullable(),
  seller: sellerSchema.nullable()
});
export type DealDto = z.infer<typeof dealSchema>;

export const createDealSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional().nullable(),
  value: z.coerce.number().nonnegative(),
  status: openDealStatusSchema.default("NEW"),
  leadId: z.string().uuid(),
  sellerId: z.string().uuid()
});
export type CreateDealDto = z.infer<typeof createDealSchema>;

export const updateDealSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional().nullable(),
    value: z.coerce.number().nonnegative().optional(),
    leadId: z.string().uuid().optional(),
    sellerId: z.string().uuid().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Informe ao menos um campo para atualizar"
  });
export type UpdateDealDto = z.infer<typeof updateDealSchema>;

export const dealListQuerySchema = paginationQuerySchema.extend({
  status: dealStatusSchema.optional(),
  sellerId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  search: z.string().trim().optional()
});
export type DealListQuery = z.infer<typeof dealListQuerySchema>;

export const changeDealStatusSchema = z.object({
  status: dealStatusSchema
});
export type ChangeDealStatusDto = z.infer<typeof changeDealStatusSchema>;

export const loseDealSchema = z.object({
  reason: z.string().trim().min(1).optional()
});
export type LoseDealDto = z.infer<typeof loseDealSchema>;
