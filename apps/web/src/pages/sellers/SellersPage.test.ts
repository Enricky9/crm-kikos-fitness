import { describe, expect, it } from "vitest";

import type { DealDto, SellerDto } from "@kikos/shared";

import { buildSellerPerformanceRows, getSellerTotals } from "../../features/sellers/lib/seller-performance";

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

describe("Seller metrics", () => {
  it("agrega negocios por vendedor", () => {
    const deals = [
      makeDeal({ id: "00000000-0000-4000-8000-000000000101", sellerId: sellerA.id, status: "WON", value: "1000" }),
      makeDeal({ id: "00000000-0000-4000-8000-000000000102", sellerId: sellerA.id, status: "LOST", value: "500" }),
      makeDeal({ id: "00000000-0000-4000-8000-000000000103", sellerId: sellerA.id, status: "PROPOSAL", value: "800" }),
      makeDeal({ id: "00000000-0000-4000-8000-000000000104", sellerId: sellerB.id, status: "WON", value: "3000" })
    ];

    expect(buildSellerPerformanceRows([sellerA, sellerB], deals)).toEqual([
      {
        conversionRate: 100,
        id: sellerB.id,
        lostCount: 0,
        name: "Bia",
        openCount: 0,
        openValue: 0,
        totalCount: 1,
        wonCount: 1,
        wonValue: 3000
      },
      {
        conversionRate: 33,
        id: sellerA.id,
        lostCount: 1,
        name: "Ana",
        openCount: 1,
        openValue: 800,
        totalCount: 3,
        wonCount: 1,
        wonValue: 1000
      }
    ]);
  });

  it("calcula totais da tela de vendedores", () => {
    const rows = [
      {
        conversionRate: 50,
        id: sellerA.id,
        lostCount: 1,
        name: "Ana",
        openCount: 2,
        openValue: 1800,
        totalCount: 4,
        wonCount: 2,
        wonValue: 2400
      },
      {
        conversionRate: 25,
        id: sellerB.id,
        lostCount: 1,
        name: "Bia",
        openCount: 1,
        openValue: 600,
        totalCount: 4,
        wonCount: 1,
        wonValue: 900
      }
    ];

    expect(getSellerTotals(rows)).toEqual({
      openCount: 3,
      openValue: 2400,
      totalCount: 8,
      wonValue: 3300
    });
  });
});
