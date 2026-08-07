import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { createCommentSchema, type CreateCommentDto } from "@kikos/shared";

import { HttpError } from "../../../shared/api/http";
import { createLeadCommentRequest, getLeadRequest, listLeadCommentsRequest, listLeadDealsRequest } from "../api/leads-api";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof HttpError) {
    return error.payload.error.message;
  }

  return fallback;
};

export const useLeadDetails = ({ leadId, token }: { readonly leadId: string | undefined; readonly token: string | null }) => {
  const queryClient = useQueryClient();
  const commentForm = useForm<CreateCommentDto>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: ""
    }
  });

  const leadQuery = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => getLeadRequest(token ?? "", leadId ?? ""),
    enabled: Boolean(token && leadId)
  });

  const [commentsQuery, dealsQuery] = useQueries({
    queries: [
      {
        queryKey: ["lead-comments", leadId],
        queryFn: () => listLeadCommentsRequest(token ?? "", leadId ?? ""),
        enabled: Boolean(token && leadId)
      },
      {
        queryKey: ["lead-deals", leadId],
        queryFn: () => listLeadDealsRequest(token ?? "", leadId ?? ""),
        enabled: Boolean(token && leadId)
      }
    ]
  });

  const commentMutation = useMutation({
    mutationFn: (input: CreateCommentDto) => createLeadCommentRequest(token ?? "", leadId ?? "", input),
    onSuccess: () => {
      commentForm.reset({ content: "" });
      void queryClient.invalidateQueries({ queryKey: ["lead-comments", leadId] });
    }
  });

  return {
    addComment: commentForm.handleSubmit((values) => {
      commentMutation.mutate(values);
    }),
    commentError: commentMutation.error
      ? getErrorMessage(commentMutation.error, "Nao foi possivel adicionar o comentario.")
      : null,
    commentForm,
    comments: commentsQuery.data?.comments ?? [],
    deals: dealsQuery.data?.data ?? [],
    isCommentPending: commentMutation.isPending,
    isCommentsError: commentsQuery.isError,
    isCommentsLoading: commentsQuery.isLoading,
    isDealsError: dealsQuery.isError,
    isDealsLoading: dealsQuery.isLoading,
    isLeadError: leadQuery.isError,
    isLeadLoading: leadQuery.isLoading,
    lead: leadQuery.data?.lead ?? null
  };
};
