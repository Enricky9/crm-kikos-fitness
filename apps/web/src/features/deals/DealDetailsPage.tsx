import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReplayIcon from "@mui/icons-material/Replay";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useParams } from "react-router-dom";

import { createCommentSchema, dealStatusLabels, type CreateCommentDto, type DealDto, type DealStatus } from "@kikos/shared";

import { HttpError } from "../../shared/api/http";
import { useAuth } from "../../auth/AuthContext";
import { EmptyState } from "../../shared/components/EmptyState";
import { LoadingState } from "../../shared/components/LoadingState";
import { getDealStatusChipSx } from "../../ui/status-chip";
import { formatCurrency, formatDateTime } from "../../shared/utils/format";
import {
  changeDealStatusRequest,
  createDealCommentRequest,
  getDealRequest,
  loseDealRequest,
  reopenDealRequest,
  winDealRequest
} from "./deals-api";

const statusOptions: Record<DealStatus, readonly DealStatus[]> = {
  NEW: ["NEW", "IN_PROGRESS", "LOST"],
  IN_PROGRESS: ["IN_PROGRESS", "NEW", "PROPOSAL", "WON", "LOST"],
  PROPOSAL: ["PROPOSAL", "IN_PROGRESS", "WON", "LOST"],
  WON: ["WON"],
  LOST: ["LOST"]
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof HttpError) {
    return error.payload.error.message;
  }

  return fallback;
};

export const DealDetailsPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [lostReason, setLostReason] = useState("");

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

  if (dealQuery.isLoading) {
    return (
      <Stack spacing={2}>
        <LoadingState blocks={[{ height: 48, width: 280 }, { height: 220 }, { height: 180 }]} />
      </Stack>
    );
  }

  if (dealQuery.isError || !dealQuery.data) {
    return <Alert severity="error">Nao foi possivel carregar o negocio.</Alert>;
  }

  const deal = dealQuery.data.deal;
  const isClosed = deal.status === "WON" || deal.status === "LOST";
  const mutationError = statusMutation.error ?? reopenMutation.error ?? commentMutation.error;
  const errorMessage = mutationError ? getErrorMessage(mutationError, "Nao foi possivel concluir a operacao.") : null;

  const submitComment = commentForm.handleSubmit((values) => {
    commentMutation.mutate(values);
  });

  const handleStatusChange = (status: DealStatus) => {
    if (status === deal.status) {
      return;
    }

    if (status === "LOST") {
      setLostDialogOpen(true);
      return;
    }

    statusMutation.mutate({ deal, status });
  };

  const confirmLost = () => {
    statusMutation.mutate(
      { deal, status: "LOST", reason: lostReason.trim() || undefined },
      {
        onSuccess: () => {
          setLostReason("");
          setLostDialogOpen(false);
        }
      }
    );
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
        <Stack spacing={1.5}>
          <Button component={RouterLink} startIcon={<ArrowBackIcon />} to="/deals/board" variant="text">
            Voltar
          </Button>
          <Box>
            <Typography component="h1" variant="h4">
              {deal.title}
            </Typography>
            <Typography color="text.secondary">{deal.lead?.name ?? "Lead nao informado"}</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            disabled={isClosed || statusMutation.isPending}
            onClick={() => {
              statusMutation.mutate({ deal, status: "WON" });
            }}
            startIcon={<CheckCircleIcon />}
            variant="contained"
          >
            Marcar ganho
          </Button>
          <Button
            color="inherit"
            disabled={isClosed || statusMutation.isPending}
            onClick={() => {
              setLostDialogOpen(true);
            }}
            variant="outlined"
          >
            Marcar perdido
          </Button>
          <Button
            disabled={!isClosed || reopenMutation.isPending}
            onClick={() => {
              reopenMutation.mutate(deal);
            }}
            startIcon={<ReplayIcon />}
            variant="outlined"
          >
            Reabrir
          </Button>
        </Stack>
      </Stack>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Box
        sx={{
          alignItems: "start",
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" }
        }}
      >
        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              boxShadow: "0 18px 44px rgba(0, 0, 0, 0.22)",
              p: { xs: 2, md: 3 }
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip label={dealStatusLabels[deal.status]} sx={getDealStatusChipSx(deal.status)} variant="outlined" />
                <Chip
                  label={formatCurrency(Number(deal.value))}
                  sx={{ bgcolor: "rgba(154, 154, 165, 0.12)", color: "text.primary" }}
                  variant="outlined"
                />
              </Stack>

              <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
                {deal.description ?? "Sem descricao."}
              </Typography>

              {deal.lostReason ? <Alert severity="warning">Motivo da perda: {deal.lostReason}</Alert> : null}

              <Box
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }
                }}
              >
                <Info label="Lead" value={deal.lead?.name ?? "-"} />
                <Info label="Empresa" value={deal.lead?.company ?? "-"} />
                <Info label="Vendedor" value={deal.seller?.name ?? "-"} />
                <Info label="Criado em" value={formatDateTime(deal.createdAt)} />
                <Info label="Atualizado em" value={formatDateTime(deal.updatedAt)} />
                <Info label="Fechado em" value={deal.closedAt ? formatDateTime(deal.closedAt) : "-"} />
              </Box>

              <FormControl fullWidth sx={{ maxWidth: 360 }}>
                <InputLabel id="deal-status-label">Alterar status</InputLabel>
                <Select
                  disabled={statusMutation.isPending || isClosed}
                  label="Alterar status"
                  labelId="deal-status-label"
                  onChange={(event) => {
                    handleStatusChange(event.target.value as DealStatus);
                  }}
                  value={deal.status}
                >
                  {statusOptions[deal.status].map((status) => (
                    <MenuItem key={status} value={status}>
                      {dealStatusLabels[status]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              p: { xs: 2, md: 3 }
            }}
          >
            <Stack spacing={2}>
              <Typography component="h2" variant="h6">
                Comentarios
              </Typography>

              <Paper
                component="form"
                elevation={0}
                onSubmit={(event) => {
                  void submitComment(event);
                }}
                sx={{ bgcolor: "#111115", border: 1, borderColor: "divider", p: 2 }}
              >
                <Stack spacing={2}>
                  <Controller
                    control={commentForm.control}
                    name="content"
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        error={Boolean(fieldState.error)}
                        fullWidth
                        helperText={fieldState.error?.message}
                        label="Novo comentario"
                        multiline
                        minRows={3}
                      />
                    )}
                  />
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
                    <Button
                      disabled={commentMutation.isPending}
                      startIcon={commentMutation.isPending ? <SaveIcon /> : <SendIcon />}
                      type="submit"
                      variant="contained"
                    >
                      {commentMutation.isPending ? "Salvando..." : "Adicionar comentario"}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>

              {deal.comments.length === 0 ? (
                <EmptyState
                  description="Use o campo acima para registrar a proxima interacao."
                  title="Nenhum comentario registrado."
                />
              ) : null}

              <List disablePadding>
                {deal.comments.map((comment) => (
                  <ListItem
                    alignItems="flex-start"
                    key={comment.id}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 1,
                      px: 2
                    }}
                  >
                    <ListItemText
                      primary={comment.content}
                      secondary={`${comment.author?.name ?? "Autor"} - ${formatDateTime(comment.createdAt)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Stack>
          </Paper>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            p: { xs: 2, md: 3 },
            position: { lg: "sticky" },
            top: { lg: 24 }
          }}
        >
          <Stack spacing={2}>
            <Typography component="h2" variant="h6">
              Historico de status
            </Typography>
            {deal.statusHistory.length === 0 ? (
              <EmptyState minHeight={96} title="Nenhum historico registrado." />
            ) : null}
            <List disablePadding>
              {deal.statusHistory.map((history) => (
                <ListItem
                  disableGutters
                  key={history.id}
                  sx={{
                    alignItems: "flex-start",
                    gap: 1.5,
                    py: 1.25
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      bgcolor: "primary.main",
                      borderRadius: "50%",
                      boxShadow: "0 0 0 5px rgba(255, 77, 45, 0.12)",
                      flexShrink: 0,
                      height: 8,
                      mt: 1,
                      width: 8
                    }}
                  />
                  <ListItemText
                    primary={`${history.fromStatus ? dealStatusLabels[history.fromStatus] : "Criacao"} -> ${
                      dealStatusLabels[history.toStatus]
                    }`}
                    secondary={`${history.changedByUser?.name ?? "Usuario"} - ${formatDateTime(history.createdAt)}`}
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        </Paper>
      </Box>

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => {
          setLostDialogOpen(false);
        }}
        open={lostDialogOpen}
      >
        <DialogTitle>Marcar negocio como perdido</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Motivo da perda"
            margin="dense"
            multiline
            minRows={3}
            onChange={(event) => {
              setLostReason(event.target.value);
            }}
            value={lostReason}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setLostDialogOpen(false);
            }}
          >
            Cancelar
          </Button>
          <Button disabled={statusMutation.isPending} onClick={confirmLost} variant="contained">
            Confirmar perda
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

const Info = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <Box
    sx={{
      bgcolor: "#111115",
      border: 1,
      borderColor: "divider",
      borderRadius: 1,
      minWidth: 0,
      p: 1.5
    }}
  >
    <Typography color="text.secondary" variant="body2">
      {label}
    </Typography>
    <Typography fontWeight={700} noWrap>
      {value}
    </Typography>
  </Box>
);
