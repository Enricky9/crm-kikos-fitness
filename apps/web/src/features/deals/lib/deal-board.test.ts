import { describe, expect, it } from "vitest";

import type { DealDto } from "@kikos/shared";

import { boardStatuses, groupDealsByStatus, nextStatusOptions } from "./deal-board";

const makeDeal = (overrides: Partial<DealDto>): DealDto => ({
  closedAt: null,
  createdAt: "2026-01-01T10:00:00.000Z",
  description: null,
  id: "00000000-0000-4000-8000-000000000100",
  lead: null,
  leadId: "00000000-0000-4000-8000-000000000200",
  lostReason: null,
  seller: null,
  sellerId: "00000000-0000-4000-8000-000000000300",
  status: "NEW",
  title: "Plano anual",
  updatedAt: "2026-01-01T10:00:00.000Z",
  value: "1000",
  ...overrides
});

describe("deal board", () => {
  it("mantem a ordem das colunas do funil", () => {
    expect(boardStatuses).toEqual(["NEW", "IN_PROGRESS", "PROPOSAL", "WON", "LOST"]);
  });

  it("agrupa negocios por status mantendo colunas vazias", () => {
    const newDeal = makeDeal({ id: "00000000-0000-4000-8000-000000000101", status: "NEW" });
    const wonDeal = makeDeal({ id: "00000000-0000-4000-8000-000000000102", status: "WON" });

    expect(groupDealsByStatus([newDeal, wonDeal])).toEqual({
      NEW: [newDeal],
      IN_PROGRESS: [],
      PROPOSAL: [],
      WON: [wonDeal],
      LOST: []
    });
  });

  it("bloqueia mudancas em negocios encerrados", () => {
    expect(nextStatusOptions.WON).toEqual(["WON"]);
    expect(nextStatusOptions.LOST).toEqual(["LOST"]);
  });
});
