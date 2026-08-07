import type { DealDto, DealStatus } from "@kikos/shared";

export const boardStatuses = ["NEW", "IN_PROGRESS", "PROPOSAL", "WON", "LOST"] as const satisfies readonly DealStatus[];

export const nextStatusOptions: Record<DealStatus, readonly DealStatus[]> = {
  NEW: ["NEW", "IN_PROGRESS", "LOST"],
  IN_PROGRESS: ["IN_PROGRESS", "NEW", "PROPOSAL", "WON", "LOST"],
  PROPOSAL: ["PROPOSAL", "IN_PROGRESS", "WON", "LOST"],
  WON: ["WON"],
  LOST: ["LOST"]
};

export type BoardData = Record<DealStatus, readonly DealDto[]>;

const emptyBoard = (): BoardData => ({
  NEW: [],
  IN_PROGRESS: [],
  PROPOSAL: [],
  WON: [],
  LOST: []
});

export const groupDealsByStatus = (deals: readonly DealDto[]) =>
  deals.reduce<BoardData>((board, deal) => {
    board[deal.status] = [...board[deal.status], deal];
    return board;
  }, emptyBoard());
