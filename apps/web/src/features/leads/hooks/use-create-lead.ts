import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { createLeadSchema, type CreateLeadDto } from "@kikos/shared";

import { HttpError } from "../../../shared/api/http";
import { createLeadRequest } from "../api/leads-api";

export const useCreateLead = (token: string | null) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<CreateLeadDto>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      source: ""
    }
  });

  const createLeadMutation = useMutation({
    mutationFn: (input: CreateLeadDto) => createLeadRequest(token ?? "", input),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      void navigate(`/leads/${response.lead.id}`, { replace: true });
    }
  });

  return {
    errorMessage:
      createLeadMutation.error instanceof HttpError
        ? createLeadMutation.error.payload.error.message
        : createLeadMutation.isError
          ? "Nao foi possivel criar o lead."
          : null,
    form,
    isPending: createLeadMutation.isPending,
    submit: form.handleSubmit((values) => {
      createLeadMutation.mutate(values);
    })
  };
};
