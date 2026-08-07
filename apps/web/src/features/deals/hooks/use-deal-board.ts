import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DealDto, DealStatus } from "@kikos/shared";
import { useMemo, useState } from "react";

import { HttpError } from "../../../shared/api/http";
import { changeDealStatusRequest, listDealsRequest, loseDealRequest, winDealRequest } from "../api/deals-api";
import { groupDealsByStatus } from "../lib/deal-board";

type BoardToast = {
  readonly severity: "success" | "error";
  readonly message: string;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof HttpError) {
    return error.payload.error.message;
  }

  return "Nao foi possivel atualizar o board.";
};

export const useDealBoard = ({ search, token }: { readonly search: string; readonly token: string }) => {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<BoardToast | null>(null);

  const dealsQuery = useQuery({
    queryKey: ["deals", "board", search],
    queryFn: () => listDealsRequest(token, { page: 1, pageSize: 100, search: search || undefined }),
    enabled: Boolean(token)
  });

  const deals = dealsQuery.data?.data ?? [];
  const board = useMemo(() => groupDealsByStatus(deals), [deals]);

  const updateBoardCache = (dealId: string, status: DealStatus) => {
    queryClient.setQueryData<Awaited<ReturnType<typeof listDealsRequest>>>(["deals", "board", search], (current) =>
      current
        ? {
            ...current,
            data: current.data.map((deal) =>
              deal.id === dealId
                ? {
                    ...deal,
                    status
                  }
                : deal
            )
          }
        : current
    );
  };

  const statusMutation = useMutation({
    mutationFn: ({ deal, status }: { readonly deal: DealDto; readonly status: DealStatus }) => {
      if (status === "WON") {
        return winDealRequest(token, deal.id);
      }

      if (status === "LOST") {
        return loseDealRequest(token, deal.id);
      }

      return changeDealStatusRequest(token, deal.id, { status });
    },
    onMutate: async ({ deal, status }) => {
      await queryClient.cancelQueries({ queryKey: ["deals", "board", search] });
      const previousBoard = queryClient.getQueryData<Awaited<ReturnType<typeof listDealsRequest>>>([
        "deals",
        "board",
        search
      ]);

      updateBoardCache(deal.id, status);
      return { previousBoard };
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(["deals", "board", search], context?.previousBoard);
      setToast({ severity: "error", message: getErrorMessage(error) });
    },
    onSuccess: ({ deal }) => {
      queryClient.setQueryData<Awaited<ReturnType<typeof listDealsRequest>>>(["deals", "board", search], (current) =>
        current
          ? {
              ...current,
              data: current.data.map((item) => (item.id === deal.id ? deal : item))
            }
          : current
      );
      setToast({ severity: "success", message: "Status atualizado." });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["deals", "board"] });
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  });

  const changeStatus = (deal: DealDto, status: DealStatus) => {
    if (deal.status === status || statusMutation.isPending) {
      return;
    }

    statusMutation.mutate({ deal, status });
  };

  return {
    board,
    changeStatus,
    closeToast: () => {
      setToast(null);
    },
    deals,
    errorMessage: dealsQuery.isError ? getErrorMessage(dealsQuery.error) : null,
    isLoading: dealsQuery.isLoading,
    isStatusPending: statusMutation.isPending,
    toast
  };
};
