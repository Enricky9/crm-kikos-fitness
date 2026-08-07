import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import type { z } from "zod";

import { createDealSchema, dealStatusLabels, type CreateDealDto, type OpenDealStatus } from "@kikos/shared";

import { useAuth } from "../../features/auth/AuthContext";
import { createDealRequest, listSellersRequest } from "../../features/deals/api/deals-api";
import { listLeadsRequest } from "../../features/leads/api/leads-api";
import { HttpError } from "../../shared/api/http";
import { LoadingState } from "../../shared/components/LoadingState";

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
    <Stack spacing={3} sx={{ maxWidth: 980, mx: "auto", width: "100%" }}>
      <Stack spacing={1.5}>
        <Button component={RouterLink} startIcon={<ArrowBackIcon />} to="/deals/board" variant="text">
          Voltar
        </Button>
        <Box>
          <Typography component="h1" variant="h4">
            Criar negocio
          </Typography>
          <Typography color="text.secondary">Registre uma oportunidade e posicione no funil comercial.</Typography>
        </Box>
      </Stack>

      <Paper
        component="form"
        elevation={0}
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        sx={{
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          boxShadow: "0 18px 44px rgba(0, 0, 0, 0.22)",
          p: { xs: 2, md: 3 }
        }}
      >
        <Stack spacing={3}>
          {optionsError ? <Alert severity="error">{optionsError}</Alert> : null}
          {mutationError ? <Alert severity="error">{mutationError}</Alert> : null}
          {isLoadingOptions ? <LoadingState blocks={[{ height: 80 }]} /> : null}

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }
            }}
          >
            <Box sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}>
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
            </Box>

            <Box sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}>
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
            </Box>

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
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
            <Button
              disabled={createMutation.isPending || isLoadingOptions}
              startIcon={<SaveIcon />}
              type="submit"
              variant="contained"
            >
              {createMutation.isPending ? "Salvando..." : "Salvar negocio"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};
