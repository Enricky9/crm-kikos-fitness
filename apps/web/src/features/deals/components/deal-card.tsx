import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Button, Chip, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Stack, Tooltip, Typography } from "@mui/material";
import type { DealDto, DealStatus } from "@kikos/shared";
import { dealStatusLabels } from "@kikos/shared";
import { Link as RouterLink } from "react-router-dom";

import { formatCurrency, formatDateTime } from "../../../shared/utils/format";
import { getDealStatusChipSx } from "./deal-status-chip";
import { nextStatusOptions } from "../lib/deal-board";

type DealCardProps = {
  readonly deal: DealDto;
  readonly disabled: boolean;
  readonly onStatusChange: (deal: DealDto, status: DealStatus) => void;
};

export const DealCard = ({ deal, disabled, onStatusChange }: DealCardProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: deal.id, disabled });
  const style = {
    transform: CSS.Translate.toString(transform)
  };

  return (
    <Paper
      elevation={0}
      ref={setNodeRef}
      style={style}
      sx={{
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 12px 28px rgba(0, 0, 0, 0.2)",
        cursor: disabled ? "default" : "grab",
        p: 2,
        touchAction: "none",
        transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 18px 42px rgba(255, 77, 45, 0.16)"
        }
      }}
      {...listeners}
      {...attributes}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography component="h3" fontWeight={700} noWrap variant="subtitle2">
              {deal.title}
            </Typography>
            <Typography color="text.secondary" noWrap variant="body2">
              {deal.lead?.name ?? "Lead nao informado"}
            </Typography>
          </Box>
          <Tooltip title="Abrir detalhes">
            <IconButton
              aria-label="Abrir detalhes do negocio"
              component={RouterLink}
              size="small"
              to={`/deals/${deal.id}`}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label={dealStatusLabels[deal.status]}
            size="small"
            sx={getDealStatusChipSx(deal.status)}
            variant="outlined"
          />
          <Chip label={formatCurrency(Number(deal.value))} size="small" variant="outlined" />
        </Stack>

        <Stack spacing={0.5}>
          <Typography color="text.secondary" variant="body2">
            Vendedor: {deal.seller?.name ?? "Nao atribuido"}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Atualizado em {formatDateTime(deal.updatedAt)}
          </Typography>
        </Stack>

        <FormControl fullWidth size="small">
          <InputLabel id={`status-${deal.id}`}>Status</InputLabel>
          <Select
            disabled={disabled}
            label="Status"
            labelId={`status-${deal.id}`}
            onChange={(event) => {
              onStatusChange(deal, event.target.value as DealStatus);
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

        <Stack direction="row" spacing={1}>
          <Button
            disabled={disabled || deal.status === "WON" || deal.status === "LOST"}
            fullWidth
            onClick={() => {
              onStatusChange(deal, "WON");
            }}
            size="small"
            startIcon={<CheckCircleIcon />}
            variant="outlined"
          >
            Ganho
          </Button>
          <Button
            color="inherit"
            disabled={disabled || deal.status === "WON" || deal.status === "LOST"}
            fullWidth
            onClick={() => {
              onStatusChange(deal, "LOST");
            }}
            size="small"
            startIcon={<ArrowForwardIcon />}
            variant="outlined"
          >
            Perdido
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};
