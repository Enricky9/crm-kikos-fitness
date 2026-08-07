import { Box, Paper, Stack, Typography } from "@mui/material";
import type { LeadDto } from "@kikos/shared";

import { formatDateTime } from "../../../shared/utils/format";

type LeadDetailsSummaryProps = {
  readonly lead: LeadDto;
};

export const LeadDetailsSummary = ({ lead }: LeadDetailsSummaryProps) => (
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
      <Typography component="h2" variant="h6">
        Dados do lead
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }
        }}
      >
        <Info label="E-mail" value={lead.email ?? "-"} />
        <Info label="Telefone" value={lead.phone} />
        <Info label="Origem" value={lead.source ?? "-"} />
        <Info label="Cadastro" value={formatDateTime(lead.createdAt)} />
      </Box>
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
