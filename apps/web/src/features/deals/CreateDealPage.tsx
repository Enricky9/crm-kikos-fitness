import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import type { z } from "zod";

import { createDealSchema, dealStatusLabels, type CreateDealDto, type OpenDealStatus } from "@kikos/shared";

import { HttpError } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import { listLeadsRequest } from "../leads/leads-api";
import { createDealRequest, listSellersRequest } from "./deals-api";

const initialStatuses = ["NEW", "IN_PROGRESS", "PROPOSAL"] as const satisfies readonly OpenDealStatus[];

type CreateDealFormValues = z.input<typeof createDealSchema>;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof HttpError) {
    return error.payload.error.message;
  }

  return fallback;
};

export const CreateDealPage = () => {
  const { token } = useAuth();
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

  const onSubmit = form.handleSubmit((values) => {
    createMutation.mutate(values);
  });

  const isLoadingOptions = leadsQuery.isLoading || sellersQuery.isLoading;
  const optionsError =
    leadsQuery.isError || sellersQuery.isError ? "Nao foi possivel carregar leads ou vendedores." : null;
  const mutationError = createMutation.error
    ? getErrorMessage(createMutation.error, "Nao foi possivel criar o negocio.")
    : null;

  return (
    <Stack spacing={3} maxWidth={820}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button component={RouterLink} startIcon={<ArrowBackIcon />} to="/deals/board" variant="text">
          Voltar
        </Button>
        <Typography component="h1" variant="h4">
          Criar negocio
        </Typography>
      </Stack>

      <Paper
        component="form"
        elevation={0}
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        sx={{ border: 1, borderColor: "divider", p: { xs: 2, md: 3 } }}
      >
        <Stack spacing={3}>
          {optionsError ? <Alert severity="error">{optionsError}</Alert> : null}
          {mutationError ? <Alert severity="error">{mutationError}</Alert> : null}
          {isLoadingOptions ? <Skeleton height={80} variant="rounded" /> : null}

          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                error={Boolean(fieldState.error)}
                fullWidth
                helperText={fieldState.error?.message}
                label="Titulo"
              />
            )}
          />

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                error={Boolean(fieldState.error)}
                fullWidth
                helperText={fieldState.error?.message}
                label="Descricao"
                multiline
                minRows={3}
              />
            )}
          />

          <Controller
            control={form.control}
            name="value"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                error={Boolean(fieldState.error)}
                fullWidth
                helperText={fieldState.error?.message}
                inputProps={{ min: 0, step: "0.01" }}
                label="Valor"
                type="number"
              />
            )}
          />

          <Controller
            control={form.control}
            name="leadId"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={Boolean(fieldState.error)}>
                <InputLabel id="deal-lead-label">Lead</InputLabel>
                <Select {...field} label="Lead" labelId="deal-lead-label">
                  {leadsQuery.data?.data.map((lead) => (
                    <MenuItem key={lead.id} value={lead.id}>
                      {lead.name} {lead.company ? `- ${lead.company}` : ""}
                    </MenuItem>
                  ))}
                </Select>
                {fieldState.error ? (
                  <Typography color="error" variant="caption">
                    {fieldState.error.message}
                  </Typography>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={form.control}
            name="sellerId"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={Boolean(fieldState.error)}>
                <InputLabel id="deal-seller-label">Vendedor</InputLabel>
                <Select {...field} label="Vendedor" labelId="deal-seller-label">
                  {sellersQuery.data?.sellers.map((seller) => (
                    <MenuItem key={seller.id} value={seller.id}>
                      {seller.name}
                    </MenuItem>
                  ))}
                </Select>
                {fieldState.error ? (
                  <Typography color="error" variant="caption">
                    {fieldState.error.message}
                  </Typography>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={Boolean(fieldState.error)}>
                <InputLabel id="deal-status-label">Status inicial</InputLabel>
                <Select {...field} label="Status inicial" labelId="deal-status-label">
                  {initialStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {dealStatusLabels[status]}
                    </MenuItem>
                  ))}
                </Select>
                {fieldState.error ? (
                  <Typography color="error" variant="caption">
                    {fieldState.error.message}
                  </Typography>
                ) : null}
              </FormControl>
            )}
          />

          <Button
            disabled={createMutation.isPending || isLoadingOptions}
            startIcon={<SaveIcon />}
            type="submit"
            variant="contained"
          >
            {createMutation.isPending ? "Salvando..." : "Salvar negocio"}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};
