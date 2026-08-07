import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { z } from "zod";

import { createDealSchema, type CreateDealDto } from "@kikos/shared";

import { HttpError } from "../../../shared/api/http";
import { listLeadsRequest } from "../../leads/api/leads-api";
import { createDealRequest, listSellersRequest } from "../api/deals-api";

type CreateDealFormValues = z.input<typeof createDealSchema>;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof HttpError) {
    return error.payload.error.message;
  }

  return fallback;
};

export const useCreateDeal = (token: string | null) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const selectedLeadId = searchParams.get("leadId") ?? "";

  const form = useForm<CreateDealFormValues, unknown, CreateDealDto>({
    resolver: zodResolver(createDealSchema),
    defaultValues: {
      title: "",
      description: "",
      value: 0,
      status: "NEW",
      leadId: selectedLeadId,
      sellerId: ""
    }
  });

  const [leadsQuery, sellersQuery] = useQueries({
    queries: [
      {
        queryKey: ["leads", "deal-form"],
        queryFn: () => listLeadsRequest(token ?? "", { page: 1, pageSize: 100, sortBy: "name", sortOrder: "asc" }),
        enabled: Boolean(token)
      },
      {
        queryKey: ["sellers"],
        queryFn: () => listSellersRequest(token ?? ""),
        enabled: Boolean(token)
      }
    ]
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateDealDto) => createDealRequest(token ?? "", input),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ["deals"] });
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      void navigate(`/deals/${response.deal.id}`, { replace: true });
    }
  });

  const isLoadingOptions = leadsQuery.isLoading || sellersQuery.isLoading;

  return {
    form,
    isLoadingOptions,
    isPending: createMutation.isPending,
    leads: leadsQuery.data?.data ?? [],
    mutationError: createMutation.error ? getErrorMessage(createMutation.error, "Nao foi possivel criar o negocio.") : null,
    optionsError: leadsQuery.isError || sellersQuery.isError ? "Nao foi possivel carregar leads ou vendedores." : null,
    sellers: sellersQuery.data?.sellers ?? [],
    submit: form.handleSubmit((values) => {
      createMutation.mutate(values);
    })
  };
};
