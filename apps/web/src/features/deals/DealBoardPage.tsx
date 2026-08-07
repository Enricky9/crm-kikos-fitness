import { DndContext, type DragEndEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DealDto, DealStatus } from "@kikos/shared";
import { dealStatusLabels } from "@kikos/shared";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { HttpError } from "../../shared/api/http";
import { useAuth } from "../auth/AuthContext";
import { EmptyState } from "../../shared/components/EmptyState";
import { LoadingState } from "../../shared/components/LoadingState";
import { getDealStatusChipSx } from "./components/deal-status-chip";
import { formatCurrency, formatDateTime } from "../../shared/utils/format";
import { changeDealStatusRequest, listDealsRequest, loseDealRequest, winDealRequest } from "./deals-api";

const boardStatuses = ["NEW", "IN_PROGRESS", "PROPOSAL", "WON", "LOST"] as const satisfies readonly DealStatus[];

const nextStatusOptions: Record<DealStatus, readonly DealStatus[]> = {
  NEW: ["NEW", "IN_PROGRESS", "LOST"],
  IN_PROGRESS: ["IN_PROGRESS", "NEW", "PROPOSAL", "WON", "LOST"],
  PROPOSAL: ["PROPOSAL", "IN_PROGRESS", "WON", "LOST"],
  WON: ["WON"],
  LOST: ["LOST"]
};

type BoardData = Record<DealStatus, readonly DealDto[]>;

const emptyBoard = (): BoardData => ({
  NEW: [],
  IN_PROGRESS: [],
  PROPOSAL: [],
  WON: [],
  LOST: []
});

const groupDealsByStatus = (deals: readonly DealDto[]) =>
  deals.reduce<BoardData>((board, deal) => {
    board[deal.status] = [...board[deal.status], deal];
    return board;
  }, emptyBoard());

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

type DealColumnProps = {
  readonly deals: readonly DealDto[];
  readonly isLoading: boolean;
  readonly onStatusChange: (deal: DealDto, status: DealStatus) => void;
  readonly status: DealStatus;
  readonly statusMutationPending: boolean;
};

const DealColumn = ({ deals, isLoading, onStatusChange, status, statusMutationPending }: DealColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({ id: status });

  return (
    <Paper
      elevation={0}
      ref={setNodeRef}
      sx={{
        border: 1,
        borderColor: isOver ? "primary.main" : "divider",
        bgcolor: isOver ? "rgba(255, 77, 45, 0.08)" : "#111115",
        boxShadow: isOver ? "0 18px 48px rgba(255, 77, 45, 0.14)" : "0 14px 32px rgba(0, 0, 0, 0.18)",
        minHeight: 420,
        p: 2,
        transition: "border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease"
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography component="h2" variant="subtitle1">
            {dealStatusLabels[status]}
          </Typography>
          <Chip
            label={deals.length}
            size="small"
            sx={{
              bgcolor: "rgba(255, 77, 45, 0.14)",
              borderColor: "rgba(255, 77, 45, 0.38)",
              color: "text.primary",
              minWidth: 36
            }}
            variant="outlined"
          />
        </Stack>

        <Divider />

        {isLoading ? <ColumnSkeleton /> : null}

        {!isLoading && deals.length === 0 ? (
          <EmptyState minHeight={112} title="Nenhum negocio nesta etapa." />
        ) : null}

        {!isLoading
          ? deals.map((deal) => (
              <DealCard
                deal={deal}
                disabled={statusMutationPending}
                key={deal.id}
                onStatusChange={onStatusChange}
              />
            ))
          : null}
      </Stack>
    </Paper>
  );
};

const ColumnSkeleton = () => (
  <LoadingState blocks={[{ height: 128 }, { height: 128 }]} />
);

type DealCardProps = {
  readonly deal: DealDto;
  readonly disabled: boolean;
  readonly onStatusChange: (deal: DealDto, status: DealStatus) => void;
};

const DealCard = ({ deal, disabled, onStatusChange }: DealCardProps) => {
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
