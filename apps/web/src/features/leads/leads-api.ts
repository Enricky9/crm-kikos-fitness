import type {
  CommentDto,
  CreateCommentDto,
  CreateLeadDto,
  DealDto,
  LeadDto,
  LeadListQuery,
  PaginatedLeadsDto
} from "@kikos/shared";

import { apiRequest } from "../../shared/api/http";

const toQueryString = (query: Partial<LeadListQuery>) => {
  const params = new URLSearchParams();

  if (query.page) {
    params.set("page", String(query.page));
  }

  if (query.pageSize) {
    params.set("pageSize", String(query.pageSize));
  }

  if (query.search) {
    params.set("search", query.search);
  }

  if (query.sortBy) {
    params.set("sortBy", query.sortBy);
  }

  if (query.sortOrder) {
    params.set("sortOrder", query.sortOrder);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const listLeadsRequest = (token: string, query: Partial<LeadListQuery>) =>
  apiRequest<PaginatedLeadsDto>(`/leads${toQueryString(query)}`, { token });

export const createLeadRequest = (token: string, input: CreateLeadDto) =>
  apiRequest<{ lead: LeadDto }>("/leads", {
    method: "POST",
    body: input,
    token
  });

export const getLeadRequest = (token: string, leadId: string) =>
  apiRequest<{ lead: LeadDto }>(`/leads/${leadId}`, { token });

export const listLeadCommentsRequest = (token: string, leadId: string) =>
  apiRequest<{ comments: readonly CommentDto[] }>(`/leads/${leadId}/comments`, { token });

export const createLeadCommentRequest = (token: string, leadId: string, input: CreateCommentDto) =>
  apiRequest<{ comment: CommentDto }>(`/leads/${leadId}/comments`, {
    method: "POST",
    body: input,
    token
  });

export const listLeadDealsRequest = (token: string, leadId: string) =>
  apiRequest<{
    data: readonly DealDto[];
    pagination: {
      readonly page: number;
      readonly pageSize: number;
      readonly total: number;
      readonly totalPages: number;
    };
  }>(`/deals?leadId=${leadId}&page=1&pageSize=100`, { token });
