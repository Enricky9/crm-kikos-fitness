import { useQueries } from "@tanstack/react-query";

import { listDealsRequest, listSellersRequest } from "../../deals/api/deals-api";

export const useSellersData = (token: string | null) => {
  const [sellersQuery, dealsQuery] = useQueries({
    queries: [
      {
        queryKey: ["sellers"],
        queryFn: () => listSellersRequest(token ?? ""),
        enabled: Boolean(token)
      },
      {
        queryKey: ["sellers", "deals"],
        queryFn: () => listDealsRequest(token ?? "", { page: 1, pageSize: 100 }),
        enabled: Boolean(token)
      }
    ]
  });

  return {
    deals: dealsQuery.data?.data ?? [],
    isError: sellersQuery.isError || dealsQuery.isError,
    isLoading: sellersQuery.isLoading || dealsQuery.isLoading,
    sellers: sellersQuery.data?.sellers ?? []
  };
};
