import type {
  AuthenticatedUser,
  ChangeDealStatusDto,
  CreateDealDto,
  DealDetailsDto,
  DealDto,
  DealListQuery,
  LoseDealDto,
  UpdateDealDto
} from "@kikos/shared";

export type DealListResult = {
  readonly data: readonly DealDto[];
  readonly pagination: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
  };
};

export type DealRepository = {
  readonly list: (query: DealListQuery, user: AuthenticatedUser) => Promise<DealListResult>;
  readonly create: (input: CreateDealDto, changedBy: string) => Promise<DealDto>;
  readonly findById: (dealId: string, user: AuthenticatedUser) => Promise<DealDetailsDto | null>;
  readonly update: (dealId: string, input: UpdateDealDto, user: AuthenticatedUser) => Promise<DealDto | null>;
  readonly findStatusById: (dealId: string, user: AuthenticatedUser) => Promise<DealDto | null>;
  readonly changeStatus: (
    dealId: string,
    input: ChangeDealStatusDto,
    user: AuthenticatedUser
  ) => Promise<DealDto | null>;
  readonly win: (dealId: string, user: AuthenticatedUser) => Promise<DealDto | null>;
  readonly lose: (dealId: string, input: LoseDealDto, user: AuthenticatedUser) => Promise<DealDto | null>;
  readonly reopen: (dealId: string, user: AuthenticatedUser) => Promise<DealDto | null>;
};
