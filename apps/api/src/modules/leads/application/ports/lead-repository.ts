import type { CreateLeadDto, LeadDto, LeadListQuery, UpdateLeadDto } from "@kikos/shared";

export type LeadListResult = {
  readonly data: readonly LeadDto[];
  readonly pagination: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
  };
};

export type LeadRepository = {
  readonly list: (query: LeadListQuery) => Promise<LeadListResult>;
  readonly create: (input: CreateLeadDto) => Promise<LeadDto>;
  readonly findById: (leadId: string) => Promise<LeadDto | null>;
  readonly update: (leadId: string, input: UpdateLeadDto) => Promise<LeadDto | null>;
};
