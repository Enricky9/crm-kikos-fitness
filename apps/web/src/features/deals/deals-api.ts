import type {
  ChangeDealStatusDto,
  CommentDto,
  CreateDealDto,
  CreateCommentDto,
  DealDetailsDto,
  DealDto,
  DealListQuery,
  SellerDto
} from "@kikos/shared";

import { apiRequest } from "../../shared/api/http";

type PaginatedDealsDto = {
  readonly data: readonly DealDto[];
  readonly pagination: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
  };
};

const toQueryString = (query: Partial<DealListQuery>) => {
  const params = new URLSearchParams();

  if (query.page) {
    params.set("page", String(query.page));
  }

  if (query.pageSize) {
    params.set("pageSize", String(query.pageSize));
  }

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.sellerId) {
    params.set("sellerId", query.sellerId);
  }

  if (query.leadId) {
    params.set("leadId", query.leadId);
  }

  if (query.search) {
    params.set("search", query.search);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const listDealsRequest = (token: string, query: Partial<DealListQuery> = {}) =>
  apiRequest<PaginatedDealsDto>(`/deals${toQueryString(query)}`, { token });

export const getDealRequest = (token: string, dealId: string) =>
  apiRequest<{ deal: DealDetailsDto }>(`/deals/${dealId}`, { token });

export const createDealRequest = (token: string, input: CreateDealDto) =>
  apiRequest<{ deal: DealDto }>("/deals", {
    method: "POST",
    body: input,
    token
  });

export const listSellersRequest = (token: string) =>
  apiRequest<{ sellers: readonly SellerDto[] }>("/sellers", { token });

export const changeDealStatusRequest = (token: string, dealId: string, input: ChangeDealStatusDto) =>
  apiRequest<{ deal: DealDto }>(`/deals/${dealId}/status`, {
    method: "PATCH",
    body: input,
    token
  });

export const winDealRequest = (token: string, dealId: string) =>
  apiRequest<{ deal: DealDto }>(`/deals/${dealId}/win`, {
    method: "POST",
    token
  });

export const loseDealRequest = (token: string, dealId: string, reason?: string) =>
  apiRequest<{ deal: DealDto }>(`/deals/${dealId}/lose`, {
    method: "POST",
    body: reason ? { reason } : {},
    token
  });

export const reopenDealRequest = (token: string, dealId: string) =>
  apiRequest<{ deal: DealDto }>(`/deals/${dealId}/reopen`, {
    method: "POST",
    token
  });

export const listDealCommentsRequest = (token: string, dealId: string) =>
  apiRequest<{ comments: readonly CommentDto[] }>(`/deals/${dealId}/comments`, { token });

export const createDealCommentRequest = (token: string, dealId: string, input: CreateCommentDto) =>
  apiRequest<{ comment: CommentDto }>(`/deals/${dealId}/comments`, {
    method: "POST",
    body: input,
    token
  });
