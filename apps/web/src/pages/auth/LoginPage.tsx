import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LoginIcon from "@mui/icons-material/Login";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import { Navigate } from "react-router-dom";

import { useLoginForm } from "../../features/auth/hooks/use-login-form";

export const LoginPage = () => {
  const { errorMessage, form, redirectTo, status, submit } = useLoginForm();

  if (status === "authenticated") {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        display: "grid",
        overflow: "hidden",
        placeItems: "center",
        px: 2,
        py: 4,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "auto -20% -45% -20%",
          height: "70%",
          background: "radial-gradient(circle, rgba(255, 77, 45, 0.16), rgba(11, 11, 13, 0) 62%)",
          pointerEvents: "none"
        }
      }}
    >
      <Paper
        component="form"
        onSubmit={(event) => {
          void submit(event);
        }}
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 448,
          border: 1,
          borderColor: "divider",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.42)",
          p: { xs: 3, sm: 4 },
          position: "relative"
        }}
      >
        <Stack spacing={3.5}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 18px 36px rgba(255, 77, 45, 0.26)"
              }}
            >
              <FitnessCenterIcon fontSize="large" />
            </Box>
            <Stack spacing={0.75}>
              <Typography component="h1" variant="h4">
                Kikos CRM
              </Typography>
              <Typography color="text.secondary">
                Entre na sua area comercial para acompanhar leads e negocios.
              </Typography>
            </Stack>
          </Stack>

          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <Stack spacing={2.25}>
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
                  placeholder="seu.email@empresa.com"
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
                  placeholder="Sua senha"
                  type="password"
                />
              )}
            />

            <Button
              disabled={form.formState.isSubmitting}
              fullWidth
              startIcon={<LoginIcon />}
              sx={{ minHeight: 46 }}
              type="submit"
              variant="contained"
            >
              {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
