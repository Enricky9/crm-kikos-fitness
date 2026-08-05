import type { ChangeDealStatusDto, DealDto, DealListQuery, DealStatus } from "@kikos/shared";

import { apiRequest } from "../../api/http";

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

export const statusQuery = (status: DealStatus) => ({
  page: 1,
  pageSize: 100,
  status
});
