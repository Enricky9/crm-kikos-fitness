import { Alert, Box, Chip, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";
import { dealStatusLabels, type DealDetailsDto, type DealStatus } from "@kikos/shared";

import { formatCurrency, formatDateTime } from "../../../shared/utils/format";
import { nextStatusOptions } from "../lib/deal-board";
import { getDealStatusChipSx } from "./deal-status-chip";

type DealDetailsSummaryProps = {
  readonly deal: DealDetailsDto;
  readonly isClosed: boolean;
  readonly isStatusPending: boolean;
  readonly onStatusChange: (status: DealStatus) => void;
};

export const DealDetailsSummary = ({ deal, isClosed, isStatusPending, onStatusChange }: DealDetailsSummaryProps) => (
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
          disabled={isStatusPending || isClosed}
          label="Alterar status"
          labelId="deal-status-label"
          onChange={(event) => {
            onStatusChange(event.target.value as DealStatus);
          }}
          value={deal.status}
        >
          {nextStatusOptions[deal.status].map((status) => (
            <MenuItem key={status} value={status}>
              {dealStatusLabels[status]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  </Paper>
);

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
