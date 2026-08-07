import { Alert, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { dealStatusLabels, type DealDto } from "@kikos/shared";

import { getDealStatusChipSx } from "../../deals/components/deal-status-chip";
import { EmptyState } from "../../../shared/components/EmptyState";
import { LoadingState } from "../../../shared/components/LoadingState";
import { formatCurrency } from "../../../shared/utils/format";

type LeadDealsPanelProps = {
  readonly deals: readonly DealDto[];
  readonly isError: boolean;
  readonly isLoading: boolean;
};

export const LeadDealsPanel = ({ deals, isError, isLoading }: LeadDealsPanelProps) => (
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography component="h2" variant="h6">
          Negocios
        </Typography>
        <Chip
          label={deals.length}
          size="small"
          sx={{
            bgcolor: "rgba(255, 77, 45, 0.14)",
            borderColor: "rgba(255, 77, 45, 0.38)",
            color: "text.primary",
            minWidth: 34
          }}
          variant="outlined"
        />
      </Stack>
      {isLoading ? <LoadingState blocks={[{ height: 96 }]} /> : null}
      {isError ? <Alert severity="error">Nao foi possivel carregar os negocios.</Alert> : null}
      {!isLoading && deals.length === 0 ? (
        <EmptyState description="Crie uma oportunidade a partir deste lead." title="Nenhum negocio relacionado." />
      ) : null}
      <Stack spacing={1.5}>
        {deals.map((deal) => (
          <Paper
            key={deal.id}
            elevation={0}
            sx={{
              bgcolor: "#111115",
              border: 1,
              borderColor: "divider",
              p: 2,
              transition: "border-color 160ms ease, box-shadow 160ms ease",
              "&:hover": {
                borderColor: "primary.main",
                boxShadow: "0 18px 42px rgba(255, 77, 45, 0.14)"
              }
            }}
          >
            <Stack spacing={1.25}>
              <Box>
                <Typography fontWeight={700}>{deal.title}</Typography>
                <Typography color="text.secondary">{formatCurrency(deal.value)}</Typography>
              </Box>
              <Chip
                label={dealStatusLabels[deal.status]}
                size="small"
                sx={getDealStatusChipSx(deal.status)}
                variant="outlined"
              />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  </Paper>
);
