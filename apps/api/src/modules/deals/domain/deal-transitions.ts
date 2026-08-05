import type { DealStatus } from "@kikos/shared";

const transitionMap: Record<DealStatus, readonly DealStatus[]> = {
  NEW: ["IN_PROGRESS", "LOST"],
  IN_PROGRESS: ["NEW", "PROPOSAL", "WON", "LOST"],
  PROPOSAL: ["IN_PROGRESS", "WON", "LOST"],
  WON: [],
  LOST: []
};

export const canTransitionDeal = (from: DealStatus, to: DealStatus) =>
  from === to || transitionMap[from].includes(to);

export const isClosedDealStatus = (status: DealStatus) => status === "WON" || status === "LOST";
