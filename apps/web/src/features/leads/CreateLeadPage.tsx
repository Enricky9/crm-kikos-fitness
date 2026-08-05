import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
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
    <Stack spacing={3} maxWidth={720}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button component={RouterLink} startIcon={<ArrowBackIcon />} to="/leads" variant="text">
          Voltar
        </Button>
        <Typography component="h1" variant="h4">
          Criar lead
        </Typography>
      </Stack>

      <Paper
        component="form"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        elevation={0}
        sx={{ border: 1, borderColor: "divider", p: { xs: 2, md: 3 } }}
      >
        <Stack spacing={3}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

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

          <Button
            disabled={createLeadMutation.isPending}
            startIcon={<SaveIcon />}
            type="submit"
            variant="contained"
          >
            {createLeadMutation.isPending ? "Salvando..." : "Salvar lead"}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};
