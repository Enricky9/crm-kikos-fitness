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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DealDto, DealStatus } from "@kikos/shared";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { useAuth } from "../../features/auth/AuthContext";
import { changeDealStatusRequest, listDealsRequest, loseDealRequest, winDealRequest } from "../../features/deals/api/deals-api";
import { DealColumn } from "../../features/deals/components/deal-column";
import { boardStatuses, groupDealsByStatus } from "../../features/deals/lib/deal-board";
import { HttpError } from "../../shared/api/http";

const getErrorMessage = (error: unknown) => {
  if (error instanceof HttpError) {
    return error.payload.error.message;
  }

  return "Nao foi possivel atualizar o board.";
};

export const DealBoardPage = () => {
  const auth = useAuth();
  const token = auth.token ?? "";
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ readonly severity: "success" | "error"; readonly message: string } | null>(null);

  const dealsQuery = useQuery({
    queryKey: ["deals", "board", search],
    queryFn: () => listDealsRequest(token, { page: 1, pageSize: 100, search: search || undefined }),
    enabled: Boolean(token)
  });

  const deals = dealsQuery.data?.data ?? [];
  const board = useMemo(() => groupDealsByStatus(deals), [deals]);

  const updateBoardCache = (dealId: string, status: DealStatus) => {
    queryClient.setQueryData<Awaited<ReturnType<typeof listDealsRequest>>>(["deals", "board", search], (current) =>
      current
        ? {
            ...current,
            data: current.data.map((deal) =>
              deal.id === dealId
                ? {
                    ...deal,
                    status
                  }
                : deal
            )
          }
        : current
    );
  };

  const statusMutation = useMutation({
    mutationFn: ({ deal, status }: { readonly deal: DealDto; readonly status: DealStatus }) => {
      if (status === "WON") {
        return winDealRequest(token, deal.id);
      }

      if (status === "LOST") {
        return loseDealRequest(token, deal.id);
      }

      return changeDealStatusRequest(token, deal.id, { status });
    },
    onMutate: async ({ deal, status }) => {
      await queryClient.cancelQueries({ queryKey: ["deals", "board", search] });
      const previousBoard = queryClient.getQueryData<Awaited<ReturnType<typeof listDealsRequest>>>([
        "deals",
        "board",
        search
      ]);

      updateBoardCache(deal.id, status);
      return { previousBoard };
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(["deals", "board", search], context?.previousBoard);
      setToast({ severity: "error", message: getErrorMessage(error) });
    },
    onSuccess: ({ deal }) => {
      queryClient.setQueryData<Awaited<ReturnType<typeof listDealsRequest>>>(["deals", "board", search], (current) =>
        current
          ? {
              ...current,
              data: current.data.map((item) => (item.id === deal.id ? deal : item))
            }
          : current
      );
      setToast({ severity: "success", message: "Status atualizado." });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["deals", "board"] });
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  });

  const handleStatusChange = (deal: DealDto, status: DealStatus) => {
    if (deal.status === status || statusMutation.isPending) {
      return;
    }

    statusMutation.mutate({ deal, status });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const dealId = String(event.active.id);
    const status = event.over?.id as DealStatus | undefined;
    const deal = deals.find((item) => item.id === dealId);

    if (!deal || !status || !boardStatuses.includes(status)) {
      return;
    }

    handleStatusChange(deal, status);
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

      {dealsQuery.isError ? <Alert severity="error">{getErrorMessage(dealsQuery.error)}</Alert> : null}

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
                isLoading={dealsQuery.isLoading}
                key={status}
                onStatusChange={handleStatusChange}
                status={status}
                statusMutationPending={statusMutation.isPending}
              />
            ))}
          </Box>
        </Box>
      </DndContext>

      <Snackbar
        autoHideDuration={4000}
        onClose={() => {
          setToast(null);
        }}
        open={Boolean(toast)}
      >
        <Alert severity={toast?.severity ?? "success"}>{toast?.message}</Alert>
      </Snackbar>
    </Stack>
  );
};
