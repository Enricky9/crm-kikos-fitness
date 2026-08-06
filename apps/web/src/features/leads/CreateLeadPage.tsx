import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { createLeadSchema, type CreateLeadDto } from "@kikos/shared";

import { HttpError } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import { createLeadRequest } from "./leads-api";

export const CreateLeadPage = () => {
  const { token } = useAuth();
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

  const onSubmit = form.handleSubmit((values) => {
    createLeadMutation.mutate(values);
  });

  const errorMessage =
    createLeadMutation.error instanceof HttpError
      ? createLeadMutation.error.payload.error.message
      : createLeadMutation.isError
        ? "Nao foi possivel criar o lead."
        : null;

  return (
    <Stack spacing={3} sx={{ maxWidth: 920, mx: "auto", width: "100%" }}>
      <Stack spacing={1.5}>
        <Button component={RouterLink} startIcon={<ArrowBackIcon />} to="/leads" variant="text">
          Voltar
        </Button>
        <Box>
          <Typography component="h1" variant="h4">
            Criar lead
          </Typography>
          <Typography color="text.secondary">Cadastre um contato para iniciar o relacionamento comercial.</Typography>
        </Box>
      </Stack>

      <Paper
        component="form"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          boxShadow: "0 18px 44px rgba(0, 0, 0, 0.22)",
          p: { xs: 2, md: 3 }
        }}
      >
        <Stack spacing={3}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }
            }}
          >
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  fullWidth
                  helperText={fieldState.error?.message}
                  label="Nome"
                />
              )}
            />

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  fullWidth
                  helperText={fieldState.error?.message}
                  label="E-mail"
                  type="email"
                />
              )}
            />

            <Controller
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  fullWidth
                  helperText={fieldState.error?.message}
                  label="Telefone"
                />
              )}
            />

            <Controller
              control={form.control}
              name="company"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  fullWidth
                  helperText={fieldState.error?.message}
                  label="Empresa"
                />
              )}
            />

            <Box sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}>
              <Controller
                control={form.control}
                name="source"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    error={Boolean(fieldState.error)}
                    fullWidth
                    helperText={fieldState.error?.message}
                    label="Origem"
                  />
                )}
              />
            </Box>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
            <Button
              disabled={createLeadMutation.isPending}
              startIcon={<SaveIcon />}
              type="submit"
              variant="contained"
            >
              {createLeadMutation.isPending ? "Salvando..." : "Salvar lead"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};
