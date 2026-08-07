import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Alert, Box, Chip, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { useQueries } from "@tanstack/react-query";

import { dealStatusLabels, type DealDto, type DealStatus, type SellerDto } from "@kikos/shared";

import { useAuth } from "../auth/AuthContext";
import { EmptyState } from "../../shared/components/EmptyState";
import { LoadingState } from "../../shared/components/LoadingState";
import { getDealStatusChipSx } from "../deals/components/deal-status-chip";
import { formatCurrency, formatDateTime } from "../../shared/utils/format";
import { listDealsRequest, listSellersRequest } from "../deals/api/deals-api";
import { listLeadsRequest } from "../leads/api/leads-api";

const dashboardStatuses = ["NEW", "IN_PROGRESS", "PROPOSAL", "WON", "LOST"] as const satisfies readonly DealStatus[];

export const getOpenPipelineValue = (deals: readonly DealDto[]) =>
  deals
    .filter((deal) => deal.status !== "WON" && deal.status !== "LOST")
    .reduce((total, deal) => total + Number(deal.value), 0);

export const getWonValue = (deals: readonly DealDto[]) =>
  deals.filter((deal) => deal.status === "WON").reduce((total, deal) => total + Number(deal.value), 0);

export const sortByUpdatedAt = (deals: readonly DealDto[]) =>
  [...deals].sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime());

export const buildSellerRows = (sellers: readonly SellerDto[], deals: readonly DealDto[]) =>
  sellers
    .map((seller) => {
      const sellerDeals = deals.filter((deal) => deal.sellerId === seller.id);
      const wonDeals = sellerDeals.filter((deal) => deal.status === "WON");

      return {
        id: seller.id,
        name: seller.name,
        openCount: sellerDeals.filter((deal) => deal.status !== "WON" && deal.status !== "LOST").length,
        totalCount: sellerDeals.length,
        wonValue: wonDeals.reduce((total, deal) => total + Number(deal.value), 0)
      };
    })
    .sort((first, second) => second.wonValue - first.wonValue || second.totalCount - first.totalCount);

export const DashboardPage = () => {
  const { token } = useAuth();

  const [leadsQuery, dealsQuery, sellersQuery] = useQueries({
    queries: [
      {
        queryKey: ["dashboard", "leads"],
        queryFn: () =>
          listLeadsRequest(token ?? "", {
            page: 1,
            pageSize: 100,
            sortBy: "createdAt",
            sortOrder: "desc"
          }),
        enabled: Boolean(token)
      },
      {
        queryKey: ["dashboard", "deals"],
        queryFn: () => listDealsRequest(token ?? "", { page: 1, pageSize: 100 }),
        enabled: Boolean(token)
      },
      {
        queryKey: ["dashboard", "sellers"],
        queryFn: () => listSellersRequest(token ?? ""),
        enabled: Boolean(token)
      }
    ]
  });

  const isLoading = leadsQuery.isLoading || dealsQuery.isLoading || sellersQuery.isLoading;
  const isError = leadsQuery.isError || dealsQuery.isError || sellersQuery.isError;
  const leads = leadsQuery.data?.data ?? [];
  const deals = dealsQuery.data?.data ?? [];
  const sellers = sellersQuery.data?.sellers ?? [];
  const openDeals = deals.filter((deal) => deal.status !== "WON" && deal.status !== "LOST");
  const wonDeals = deals.filter((deal) => deal.status === "WON");
  const lostDeals = deals.filter((deal) => deal.status === "LOST");
  const openPipelineValue = getOpenPipelineValue(deals);
  const wonValue = getWonValue(deals);
  const recentDeals = sortByUpdatedAt(deals).slice(0, 5);
  const sellerRows = buildSellerRows(sellers, deals).slice(0, 5);
  const totalDeals = deals.length || 1;

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography component="h1" variant="h4">
            Dashboard
          </Typography>
          <Typography color="text.secondary">Visao consolidada do funil comercial e atividade recente.</Typography>
        </Box>
        <Chip
          label={`${dealsQuery.data?.pagination.total ?? 0} negocios monitorados`}
          sx={{
            bgcolor: "rgba(255, 77, 45, 0.14)",
            borderColor: "rgba(255, 77, 45, 0.38)",
            color: "text.primary"
          }}
          variant="outlined"
        />
      </Stack>

      {isError ? <Alert severity="error">Nao foi possivel carregar os indicadores do dashboard.</Alert> : null}

      {isLoading ? <LoadingState blocks={[{ height: 112 }, { height: 280 }, { height: 220 }]} /> : null}

      {!isLoading ? (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" }
            }}
          >
            <MetricCard icon={<GroupsIcon />} label="Leads" value={leadsQuery.data?.pagination.total ?? leads.length} />
            <MetricCard icon={<TrendingUpIcon />} label="Negocios abertos" value={openDeals.length} />
            <MetricCard icon={<AttachMoneyIcon />} label="Pipeline aberto" value={formatCurrency(openPipelineValue)} />
            <MetricCard icon={<PersonPinIcon />} label="Vendedores" value={sellers.length} />
          </Box>

          <Box
            sx={{
              alignItems: "start",
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1.3fr) minmax(360px, 0.7fr)" }
            }}
          >
            <Paper elevation={0} sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider", p: { xs: 2, md: 3 } }}>
              <Stack spacing={2}>
                <Typography component="h2" variant="h6">
                  Funil por status
                </Typography>
                <Stack spacing={1.5}>
                  {dashboardStatuses.map((status) => {
                    const count = deals.filter((deal) => deal.status === status).length;
                    const percent = Math.round((count / totalDeals) * 100);

                    return (
                      <Stack key={status} spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                          <Chip
                            label={dealStatusLabels[status]}
                            size="small"
                            sx={getDealStatusChipSx(status)}
                            variant="outlined"
                          />
                          <Typography color="text.secondary" variant="body2">
                            {count} negocio{count === 1 ? "" : "s"}
                          </Typography>
                        </Stack>
                        <LinearProgress value={percent} variant="determinate" />
                      </Stack>
                    );
                  })}
                </Stack>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider", p: { xs: 2, md: 3 } }}>
              <Stack spacing={2}>
                <Typography component="h2" variant="h6">
                  Resultado
                </Typography>
                <ResultRow label="Ganho" value={formatCurrency(wonValue)} helper={`${wonDeals.length} negocios`} />
                <ResultRow label="Perdido" value={lostDeals.length} helper="negocios encerrados" />
                <ResultRow label="Taxa de ganho" value={`${Math.round((wonDeals.length / totalDeals) * 100)}%`} helper="sobre a amostra atual" />
              </Stack>
            </Paper>
          </Box>

          <Box
            sx={{
              alignItems: "start",
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 380px" }
            }}
          >
            <Paper elevation={0} sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider", p: { xs: 2, md: 3 } }}>
              <Stack spacing={2}>
                <Typography component="h2" variant="h6">
                  Negocios recentes
                </Typography>
                {recentDeals.length === 0 ? <EmptyState title="Nenhum negocio encontrado." /> : null}
                <Stack spacing={1.5}>
                  {recentDeals.map((deal) => (
                    <Paper key={deal.id} elevation={0} sx={{ bgcolor: "#111115", border: 1, borderColor: "divider", p: 2 }}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between">
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={700} noWrap>
                            {deal.title}
                          </Typography>
                          <Typography color="text.secondary" noWrap variant="body2">
                            {deal.lead?.name ?? "Lead nao informado"} - {formatDateTime(deal.updatedAt)}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip label={dealStatusLabels[deal.status]} size="small" sx={getDealStatusChipSx(deal.status)} variant="outlined" />
                          <Chip label={formatCurrency(deal.value)} size="small" variant="outlined" />
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider", p: { xs: 2, md: 3 } }}>
              <Stack spacing={2}>
                <Typography component="h2" variant="h6">
                  Vendedores
                </Typography>
                {sellerRows.length === 0 ? <EmptyState title="Nenhum vendedor encontrado." /> : null}
                <Stack spacing={1.5}>
                  {sellerRows.map((seller) => (
                    <Box
                      key={seller.id}
                      sx={{
                        bgcolor: "#111115",
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 1.5
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Typography fontWeight={800}>{seller.name}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {seller.totalCount} negocio{seller.totalCount === 1 ? "" : "s"} - {seller.openCount} aberto
                          {seller.openCount === 1 ? "" : "s"}
                        </Typography>
                        <Typography color="primary.main" fontWeight={800} variant="body2">
                          {formatCurrency(seller.wonValue)} ganhos
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Box>
        </>
      ) : null}
    </Stack>
  );
};

type MetricCardProps = {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: number | string;
};

const MetricCard = ({ icon, label, value }: MetricCardProps) => (
  <Paper elevation={0} sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider", p: 2 }}>
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          alignItems: "center",
          bgcolor: "rgba(255, 77, 45, 0.14)",
          border: 1,
          borderColor: "rgba(255, 77, 45, 0.34)",
          borderRadius: 1,
          color: "primary.main",
          display: "flex",
          flexShrink: 0,
          height: 42,
          justifyContent: "center",
          width: 42
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography fontWeight={900} noWrap variant="h6">
          {value}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const ResultRow = ({ helper, label, value }: { readonly helper: string; readonly label: string; readonly value: number | string }) => (
  <Box sx={{ bgcolor: "#111115", border: 1, borderColor: "divider", borderRadius: 1, p: 1.5 }}>
    <Stack direction="row" justifyContent="space-between" spacing={1}>
      <Box>
        <Typography fontWeight={800}>{label}</Typography>
        <Typography color="text.secondary" variant="body2">
          {helper}
        </Typography>
      </Box>
      <Typography color="primary.main" fontWeight={900}>
        {value}
      </Typography>
    </Stack>
  </Box>
);
