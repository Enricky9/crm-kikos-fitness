import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createCommentSchema, type CreateCommentDto, type DealAiSummaryDto, type DealDto, type DealStatus } from "@kikos/shared";

import { HttpError } from "../../../shared/api/http";
import {
  changeDealStatusRequest,
  createDealCommentRequest,
  generateDealAiSummaryRequest,
  getDealRequest,
  loseDealRequest,
  reopenDealRequest,
  winDealRequest
} from "../api/deals-api";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof HttpError) {
    return error.payload.error.message;
  }

  return fallback;
};

export const useDealDetails = ({ dealId, token }: { readonly dealId: string | undefined; readonly token: string | null }) => {
  const queryClient = useQueryClient();
  const [aiSummary, setAiSummary] = useState<DealAiSummaryDto | null>(null);
  const commentForm = useForm<CreateCommentDto>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: ""
    }
  });

  const dealQuery = useQuery({
    queryKey: ["deal", dealId],
    queryFn: () => getDealRequest(token ?? "", dealId ?? ""),
    enabled: Boolean(token && dealId)
  });

  const invalidateDeal = () => {
    void queryClient.invalidateQueries({ queryKey: ["deal", dealId] });
    void queryClient.invalidateQueries({ queryKey: ["deals"] });
    void queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ deal, status, reason }: { readonly deal: DealDto; readonly status: DealStatus; readonly reason?: string }) => {
      if (status === "WON") {
        return winDealRequest(token ?? "", deal.id);
      }

      if (status === "LOST") {
        return loseDealRequest(token ?? "", deal.id, reason);
      }

      return changeDealStatusRequest(token ?? "", deal.id, { status });
    },
    onSuccess: invalidateDeal
  });

  const reopenMutation = useMutation({
    mutationFn: (deal: DealDto) => reopenDealRequest(token ?? "", deal.id),
    onSuccess: invalidateDeal
  });

  const commentMutation = useMutation({
    mutationFn: (input: CreateCommentDto) => createDealCommentRequest(token ?? "", dealId ?? "", input),
    onSuccess: () => {
      commentForm.reset({ content: "" });
      void queryClient.invalidateQueries({ queryKey: ["deal", dealId] });
    }
  });

  const aiSummaryMutation = useMutation({
    mutationFn: () => generateDealAiSummaryRequest(token ?? "", dealId ?? ""),
    onSuccess: (result) => {
      setAiSummary(result.summary);
    }
  });

  const mutationError = statusMutation.error ?? reopenMutation.error ?? commentMutation.error;

  return {
    addComment: commentForm.handleSubmit((values) => {
      commentMutation.mutate(values);
    }),
    aiSummary,
    aiSummaryErrorMessage: aiSummaryMutation.error
      ? getErrorMessage(aiSummaryMutation.error, "Nao foi possivel gerar o resumo com IA.")
      : null,
    commentForm,
    deal: dealQuery.data?.deal ?? null,
    generateAiSummary: () => {
      aiSummaryMutation.mutate();
    },
    errorMessage: mutationError ? getErrorMessage(mutationError, "Nao foi possivel concluir a operacao.") : null,
    isAiSummaryPending: aiSummaryMutation.isPending,
    isCommentPending: commentMutation.isPending,
    isDealError: dealQuery.isError,
    isDealLoading: dealQuery.isLoading,
    isReopenPending: reopenMutation.isPending,
    isStatusPending: statusMutation.isPending,
    reopenDeal: (deal: DealDto) => {
      reopenMutation.mutate(deal);
    },
    setDealStatus: (
      deal: DealDto,
      status: DealStatus,
      options?: { readonly reason?: string; readonly onSuccess?: () => void }
    ) => {
      statusMutation.mutate(
        { deal, status, reason: options?.reason },
        {
          onSuccess: options?.onSuccess
        }
      );
    }
  };
};
