import { Box, List, ListItem, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { dealStatusLabels, type DealDetailsDto } from "@kikos/shared";

import { EmptyState } from "../../../shared/components/EmptyState";
import { formatDateTime } from "../../../shared/utils/format";

type DealStatusHistoryProps = {
  readonly history: DealDetailsDto["statusHistory"];
};

export const DealStatusHistory = ({ history }: DealStatusHistoryProps) => (
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
      {history.length === 0 ? <EmptyState minHeight={96} title="Nenhum historico registrado." /> : null}
      <List disablePadding>
        {history.map((item) => (
          <ListItem
            disableGutters
            key={item.id}
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
              primary={`${item.fromStatus ? dealStatusLabels[item.fromStatus] : "Criacao"} -> ${
                dealStatusLabels[item.toStatus]
              }`}
              secondary={`${item.changedByUser?.name ?? "Usuario"} - ${formatDateTime(item.createdAt)}`}
            />
          </ListItem>
        ))}
      </List>
    </Stack>
  </Paper>
);
