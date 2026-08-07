import type { DealDto, DealStatus, SellerDto } from "@kikos/shared";

export const dashboardStatuses = ["NEW", "IN_PROGRESS", "PROPOSAL", "WON", "LOST"] as const satisfies readonly DealStatus[];

export const getOpenPipelineValue = (deals: readonly DealDto[]) =>
  deals
    .filter((deal) => deal.status !== "WON" && deal.status !== "LOST")
    .reduce((total, deal) => total + Number(deal.value), 0);

export const getWonValue = (deals: readonly DealDto[]) =>
  deals.filter((deal) => deal.status === "WON").reduce((total, deal) => total + Number(deal.value), 0);

export const sortByUpdatedAt = (deals: readonly DealDto[]) =>
  [...deals].sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime());

export const buildSellerRows = (sellers: readonly SellerDto[], deals: readonly DealDto[]) =>
  sellers
    .map((seller) => {
      const sellerDeals = deals.filter((deal) => deal.sellerId === seller.id);
      const wonDeals = sellerDeals.filter((deal) => deal.status === "WON");

      return {
        id: seller.id,
        name: seller.name,
        openCount: sellerDeals.filter((deal) => deal.status !== "WON" && deal.status !== "LOST").length,
        totalCount: sellerDeals.length,
        wonValue: wonDeals.reduce((total, deal) => total + Number(deal.value), 0)
      };
    })
    .sort((first, second) => second.wonValue - first.wonValue || second.totalCount - first.totalCount);
