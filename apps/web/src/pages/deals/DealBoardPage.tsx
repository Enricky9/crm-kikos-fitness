import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import type { DealStatus } from "@kikos/shared";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { useAuth } from "../../features/auth/AuthContext";
import { DealColumn } from "../../features/deals/components/deal-column";
import { useDealBoard } from "../../features/deals/hooks/use-deal-board";
import { boardStatuses } from "../../features/deals/lib/deal-board";

export const DealBoardPage = () => {
  const auth = useAuth();
  const token = auth.token ?? "";
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [search, setSearch] = useState("");
  const { board, changeStatus, closeToast, deals, errorMessage, isLoading, isStatusPending, toast } = useDealBoard({
    search,
    token
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const dealId = String(event.active.id);
    const status = event.over?.id as DealStatus | undefined;
    const deal = deals.find((item) => item.id === dealId);

    if (!deal || !status || !boardStatuses.includes(status)) {
      return;
    }

    changeStatus(deal, status);
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography component="h1" variant="h4">
            Funil comercial
          </Typography>
          <Typography color="text.secondary">Acompanhe oportunidades por etapa e mova cards entre colunas.</Typography>
        </Box>
        <Button component={RouterLink} startIcon={<AddIcon />} to="/deals/new" variant="contained">
          Novo negocio
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          p: { xs: 1.5, md: 2 }
        }}
      >
        <TextField
          fullWidth
          label="Buscar negocios"
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="Titulo do negocio"
          value={search}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <Box sx={{ overflowX: { xs: "auto", md: "visible" }, pb: 1 }}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: `repeat(${boardStatuses.length}, minmax(280px, 82vw))`,
                md: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(5, minmax(220px, 1fr))"
              },
              alignItems: "start"
            }}
          >
            {boardStatuses.map((status) => (
              <DealColumn
                deals={board[status]}
                isLoading={isLoading}
                key={status}
                onStatusChange={changeStatus}
                status={status}
                statusMutationPending={isStatusPending}
              />
            ))}
          </Box>
        </Box>
      </DndContext>

      <Snackbar
        autoHideDuration={4000}
        onClose={closeToast}
        open={Boolean(toast)}
      >
        <Alert severity={toast?.severity ?? "success"}>{toast?.message}</Alert>
      </Snackbar>
    </Stack>
  );
};
