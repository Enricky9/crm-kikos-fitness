import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReplayIcon from "@mui/icons-material/Replay";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { Link as RouterLink, useParams } from "react-router-dom";

import type { DealStatus } from "@kikos/shared";

import { useAuth } from "../../features/auth/AuthContext";
import { DealAiSummaryPanel } from "../../features/deals/components/deal-ai-summary-panel";
import { DealDetailsSummary } from "../../features/deals/components/deal-details-summary";
import { DealStatusHistory } from "../../features/deals/components/deal-status-history";
import { useDealDetails } from "../../features/deals/hooks/use-deal-details";
import { EmptyState } from "../../shared/components/EmptyState";
import { LoadingState } from "../../shared/components/LoadingState";
import { formatDateTime } from "../../shared/utils/format";

export const DealDetailsPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const { token } = useAuth();
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [lostReason, setLostReason] = useState("");
  const {
    addComment,
    aiSummary,
    aiSummaryErrorMessage,
    commentForm,
    deal,
    errorMessage,
    generateAiSummary,
    isAiSummaryPending,
    isCommentPending,
    isDealError,
    isDealLoading,
    isReopenPending,
    isStatusPending,
    reopenDeal,
    setDealStatus
  } = useDealDetails({
    dealId,
    token
  });

  if (isDealLoading) {
    return (
      <Stack spacing={2}>
        <LoadingState blocks={[{ height: 48, width: 280 }, { height: 220 }, { height: 180 }]} />
      </Stack>
    );
  }

  if (isDealError || !deal) {
    return <Alert severity="error">Nao foi possivel carregar o negocio.</Alert>;
  }

  const isClosed = deal.status === "WON" || deal.status === "LOST";

  const handleStatusChange = (status: DealStatus) => {
    if (status === deal.status) {
      return;
    }

    if (status === "LOST") {
      setLostDialogOpen(true);
      return;
    }

    setDealStatus(deal, status);
  };

  const confirmLost = () => {
    setDealStatus(deal, "LOST", {
      reason: lostReason.trim() || undefined,
      onSuccess: () => {
        setLostReason("");
        setLostDialogOpen(false);
      }
    });
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
            disabled={isClosed || isStatusPending}
            onClick={() => {
              setDealStatus(deal, "WON");
            }}
            startIcon={<CheckCircleIcon />}
            variant="contained"
          >
            Marcar ganho
          </Button>
          <Button
            color="inherit"
            disabled={isClosed || isStatusPending}
            onClick={() => {
              setLostDialogOpen(true);
            }}
            variant="outlined"
          >
            Marcar perdido
          </Button>
          <Button
            disabled={!isClosed || isReopenPending}
            onClick={() => {
              reopenDeal(deal);
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
          <DealDetailsSummary
            deal={deal}
            isClosed={isClosed}
            isStatusPending={isStatusPending}
            onStatusChange={handleStatusChange}
          />

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
                  void addComment(event);
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
                      disabled={isCommentPending}
                      startIcon={isCommentPending ? <SaveIcon /> : <SendIcon />}
                      type="submit"
                      variant="contained"
                    >
                      {isCommentPending ? "Salvando..." : "Adicionar comentario"}
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

        <Stack spacing={2}>
          <DealAiSummaryPanel
            errorMessage={aiSummaryErrorMessage}
            isPending={isAiSummaryPending}
            onGenerate={generateAiSummary}
            summary={aiSummary}
          />
          <DealStatusHistory history={deal.statusHistory} />
        </Stack>
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
          <Button disabled={isStatusPending} onClick={confirmLost} variant="contained">
            Confirmar perda
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
