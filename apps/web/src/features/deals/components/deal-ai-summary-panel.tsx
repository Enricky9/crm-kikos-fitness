import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";

import type { DealAiSummaryDto } from "@kikos/shared";

import { formatDateTime } from "../../../shared/utils/format";
import { getDealAiSummaryViewState } from "../lib/deal-ai-summary";

type DealAiSummaryPanelProps = {
  readonly errorMessage: string | null;
  readonly isPending: boolean;
  readonly onGenerate: () => void;
  readonly summary: DealAiSummaryDto | null;
};

export const DealAiSummaryPanel = ({
  errorMessage,
  isPending,
  onGenerate,
  summary
}: DealAiSummaryPanelProps) => {
  const state = getDealAiSummaryViewState({ errorMessage, isPending, summary });

  return (
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
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeIcon color="primary" fontSize="small" />
            <Typography component="h2" variant="h6">
              Resumo com IA
            </Typography>
          </Stack>
          <Button disabled={state.status === "loading"} onClick={onGenerate} startIcon={<AutoAwesomeIcon />} variant="outlined">
            {state.actionLabel}
          </Button>
        </Stack>

        {state.status === "error" ? <Alert severity="error">{state.errorMessage}</Alert> : null}

        {state.status === "success" ? (
          <Box
            sx={{
              bgcolor: "#111115",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              p: 2
            }}
          >
            <Stack spacing={1}>
              <Typography whiteSpace="pre-line">{state.summary.summary}</Typography>
              <Typography color="text.secondary" variant="caption">
                {state.summary.provider} - {formatDateTime(state.summary.generatedAt)}
              </Typography>
            </Stack>
          </Box>
        ) : null}

        {state.status === "idle" ? (
          <Typography color="text.secondary">
            Gere um resumo automatico dos comentarios registrados neste negocio.
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
};
