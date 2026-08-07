import { useQueries } from "@tanstack/react-query";

import { listDealsRequest, listSellersRequest } from "../../deals/api/deals-api";
import { listLeadsRequest } from "../../leads/api/leads-api";

export const useDashboardData = (token: string | null) => {
  const [leadsQuery, dealsQuery, sellersQuery] = useQueries({
    queries: [
      {
        queryKey: ["dashboard", "leads"],
        queryFn: () =>
          listLeadsRequest(token ?? "", {
            page: 1,
            pageSize: 100,
            sortBy: "createdAt",
            sortOrder: "desc"
          }),
        enabled: Boolean(token)
      },
      {
        queryKey: ["dashboard", "deals"],
        queryFn: () => listDealsRequest(token ?? "", { page: 1, pageSize: 100 }),
        enabled: Boolean(token)
      },
      {
        queryKey: ["dashboard", "sellers"],
        queryFn: () => listSellersRequest(token ?? ""),
        enabled: Boolean(token)
      }
    ]
  });

  return {
    deals: dealsQuery.data?.data ?? [],
    dealsTotal: dealsQuery.data?.pagination.total ?? 0,
    isError: leadsQuery.isError || dealsQuery.isError || sellersQuery.isError,
    isLoading: leadsQuery.isLoading || dealsQuery.isLoading || sellersQuery.isLoading,
    leads: leadsQuery.data?.data ?? [],
    leadsTotal: leadsQuery.data?.pagination.total ?? 0,
    sellers: sellersQuery.data?.sellers ?? []
  };
};
