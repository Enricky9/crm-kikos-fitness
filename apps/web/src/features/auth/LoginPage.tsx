import { zodResolver } from "@hookform/resolvers/zod";
import LoginIcon from "@mui/icons-material/Login";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { HttpError } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";

const loginFormSchema = z.object({
  email: z.string().trim().email("Informe um e-mail valido"),
  password: z.string().min(1, "Informe a senha")
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

type LocationState = {
  readonly from?: {
    readonly pathname?: string;
  };
};

export const LoginPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const locationState = location.state as LocationState | null;
  const redirectTo = locationState?.from?.pathname ?? "/deals/board";

  if (auth.status === "authenticated") {
    return <Navigate to={redirectTo} replace />;
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);

    try {
      await auth.login(values);
      void navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error instanceof HttpError) {
        setErrorMessage(error.payload.error.message);
        return;
      }

      setErrorMessage("Nao foi possivel entrar agora");
    }
  });

  return (
    <Box
      minHeight="100vh"
      display="grid"
      sx={{
        placeItems: "center",
        bgcolor: "background.default",
        px: 2
      }}
    >
      <Paper
        component="form"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          border: 1,
          borderColor: "divider",
          p: { xs: 3, sm: 4 }
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography component="h1" variant="h4">
              Kikos CRM
            </Typography>
            <Typography color="text.secondary">Acesse sua area comercial.</Typography>
          </Stack>

          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                autoComplete="email"
                autoFocus
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
            name="password"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                autoComplete="current-password"
                error={Boolean(fieldState.error)}
                fullWidth
                helperText={fieldState.error?.message}
                label="Senha"
                type="password"
              />
            )}
          />

          <Button
            disabled={form.formState.isSubmitting}
            fullWidth
            startIcon={<LoginIcon />}
            type="submit"
            variant="contained"
          >
            {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
