import type { DealDto, SellerDto } from "@kikos/shared";

export type SellerPerformanceRow = {
  readonly conversionRate: number;
  readonly id: string;
  readonly lostCount: number;
  readonly name: string;
  readonly openCount: number;
  readonly openValue: number;
  readonly totalCount: number;
  readonly wonCount: number;
  readonly wonValue: number;
};

export const buildSellerPerformanceRows = (
  sellers: readonly SellerDto[],
  deals: readonly DealDto[]
): readonly SellerPerformanceRow[] =>
  sellers
    .map((seller) => {
      const sellerDeals = deals.filter((deal) => deal.sellerId === seller.id);
      const wonDeals = sellerDeals.filter((deal) => deal.status === "WON");
      const lostDeals = sellerDeals.filter((deal) => deal.status === "LOST");
      const openDeals = sellerDeals.filter((deal) => deal.status !== "WON" && deal.status !== "LOST");
      const conversionRate = sellerDeals.length > 0 ? Math.round((wonDeals.length / sellerDeals.length) * 100) : 0;

      return {
        conversionRate,
        id: seller.id,
        lostCount: lostDeals.length,
        name: seller.name,
        openCount: openDeals.length,
        openValue: openDeals.reduce((total, deal) => total + Number(deal.value), 0),
        totalCount: sellerDeals.length,
        wonCount: wonDeals.length,
        wonValue: wonDeals.reduce((total, deal) => total + Number(deal.value), 0)
      };
    })
    .sort((first, second) => second.wonValue - first.wonValue || second.totalCount - first.totalCount);

export const getSellerTotals = (rows: readonly SellerPerformanceRow[]) => ({
  openCount: rows.reduce((total, row) => total + row.openCount, 0),
  openValue: rows.reduce((total, row) => total + row.openValue, 0),
  totalCount: rows.reduce((total, row) => total + row.totalCount, 0),
  wonValue: rows.reduce((total, row) => total + row.wonValue, 0)
});
