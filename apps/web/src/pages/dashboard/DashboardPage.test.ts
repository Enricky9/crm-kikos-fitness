import { describe, expect, it } from "vitest";

import type { DealDto, SellerDto } from "@kikos/shared";

import { buildSellerRows, getOpenPipelineValue, getWonValue, sortByUpdatedAt } from "./DashboardPage";

const sellerA: SellerDto = {
  email: "ana@example.com",
  id: "00000000-0000-4000-8000-000000000001",
  name: "Ana"
};

const sellerB: SellerDto = {
  email: "bia@example.com",
  id: "00000000-0000-4000-8000-000000000002",
  name: "Bia"
};

const makeDeal = (overrides: Partial<DealDto>): DealDto => ({
  closedAt: null,
  createdAt: "2026-01-01T10:00:00.000Z",
  description: null,
  id: "00000000-0000-4000-8000-000000000100",
  lead: null,
  leadId: "00000000-0000-4000-8000-000000000200",
  lostReason: null,
  seller: null,
  sellerId: sellerA.id,
  status: "NEW",
  title: "Plano anual",
  updatedAt: "2026-01-01T10:00:00.000Z",
  value: "1000",
  ...overrides
});

describe("Dashboard metrics", () => {
  it("calcula pipeline aberto e valor ganho por status", () => {
    const deals = [
      makeDeal({ id: "00000000-0000-4000-8000-000000000101", status: "NEW", value: "1000" }),
      makeDeal({ id: "00000000-0000-4000-8000-000000000102", status: "PROPOSAL", value: "2500" }),
      makeDeal({ id: "00000000-0000-4000-8000-000000000103", status: "WON", value: "700" }),
      makeDeal({ id: "00000000-0000-4000-8000-000000000104", status: "LOST", value: "900" })
    ];

    expect(getOpenPipelineValue(deals)).toBe(3500);
    expect(getWonValue(deals)).toBe(700);
  });

  it("ordena negocios pela atualizacao mais recente", () => {
    const deals = [
      makeDeal({ id: "00000000-0000-4000-8000-000000000101", title: "Antigo", updatedAt: "2026-01-01T10:00:00.000Z" }),
      makeDeal({ id: "00000000-0000-4000-8000-000000000102", title: "Novo", updatedAt: "2026-01-03T10:00:00.000Z" }),
      makeDeal({ id: "00000000-0000-4000-8000-000000000103", title: "Meio", updatedAt: "2026-01-02T10:00:00.000Z" })
    ];

    expect(sortByUpdatedAt(deals).map((deal) => deal.title)).toEqual(["Novo", "Meio", "Antigo"]);
  });

  it("monta ranking de vendedores por valor ganho", () => {
    const deals = [
      makeDeal({ id: "00000000-0000-4000-8000-000000000101", sellerId: sellerA.id, status: "WON", value: "1000" }),
      makeDeal({ id: "00000000-0000-4000-8000-000000000102", sellerId: sellerB.id, status: "WON", value: "2500" }),
      makeDeal({ id: "00000000-0000-4000-8000-000000000103", sellerId: sellerB.id, status: "IN_PROGRESS", value: "400" })
    ];

    expect(buildSellerRows([sellerA, sellerB], deals)).toEqual([
      {
        id: sellerB.id,
        name: "Bia",
        openCount: 1,
        totalCount: 2,
        wonValue: 2500
      },
      {
        id: sellerA.id,
        name: "Ana",
        openCount: 0,
        totalCount: 1,
        wonValue: 1000
      }
    ]);
  });
});
