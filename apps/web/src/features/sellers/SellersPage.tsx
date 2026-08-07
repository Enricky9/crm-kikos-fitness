import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import GroupsIcon from "@mui/icons-material/Groups";
import StorefrontIcon from "@mui/icons-material/Storefront";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Alert, Box, Chip, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { useQueries } from "@tanstack/react-query";

import type { DealDto, SellerDto } from "@kikos/shared";

import { useAuth } from "../auth/AuthContext";
import { EmptyState } from "../../shared/components/EmptyState";
import { LoadingState } from "../../shared/components/LoadingState";
import { formatCurrency } from "../../shared/utils/format";
import { listDealsRequest, listSellersRequest } from "../deals/api/deals-api";

export type SellerPerformanceRow = {
  readonly conversionRate: number;
  readonly id: string;
  readonly lostCount: number;
  readonly name: string;
  readonly openCount: number;
  readonly openValue: number;
  readonly totalCount: number;
  readonly wonCount: number;
  readonly wonValue: number;
};

export const buildSellerPerformanceRows = (
  sellers: readonly SellerDto[],
  deals: readonly DealDto[]
): readonly SellerPerformanceRow[] =>
  sellers
    .map((seller) => {
      const sellerDeals = deals.filter((deal) => deal.sellerId === seller.id);
      const wonDeals = sellerDeals.filter((deal) => deal.status === "WON");
      const lostDeals = sellerDeals.filter((deal) => deal.status === "LOST");
      const openDeals = sellerDeals.filter((deal) => deal.status !== "WON" && deal.status !== "LOST");
      const conversionRate = sellerDeals.length > 0 ? Math.round((wonDeals.length / sellerDeals.length) * 100) : 0;

      return {
        conversionRate,
        id: seller.id,
        lostCount: lostDeals.length,
        name: seller.name,
        openCount: openDeals.length,
        openValue: openDeals.reduce((total, deal) => total + Number(deal.value), 0),
        totalCount: sellerDeals.length,
        wonCount: wonDeals.length,
        wonValue: wonDeals.reduce((total, deal) => total + Number(deal.value), 0)
      };
    })
    .sort((first, second) => second.wonValue - first.wonValue || second.totalCount - first.totalCount);

export const getSellerTotals = (rows: readonly SellerPerformanceRow[]) => ({
  openCount: rows.reduce((total, row) => total + row.openCount, 0),
  openValue: rows.reduce((total, row) => total + row.openValue, 0),
  totalCount: rows.reduce((total, row) => total + row.totalCount, 0),
  wonValue: rows.reduce((total, row) => total + row.wonValue, 0)
});

export const SellersPage = () => {
  const { token } = useAuth();

  const [sellersQuery, dealsQuery] = useQueries({
    queries: [
      {
        queryKey: ["sellers"],
        queryFn: () => listSellersRequest(token ?? ""),
        enabled: Boolean(token)
      },
      {
        queryKey: ["sellers", "deals"],
        queryFn: () => listDealsRequest(token ?? "", { page: 1, pageSize: 100 }),
        enabled: Boolean(token)
      }
    ]
  });

  const isLoading = sellersQuery.isLoading || dealsQuery.isLoading;
  const isError = sellersQuery.isError || dealsQuery.isError;
  const sellers = sellersQuery.data?.sellers ?? [];
  const deals = dealsQuery.data?.data ?? [];
  const rows = buildSellerPerformanceRows(sellers, deals);
  const totals = getSellerTotals(rows);

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography component="h1" variant="h4">
            Vendedores
          </Typography>
          <Typography color="text.secondary">Acompanhe distribuicao, conversao e valor gerado por vendedor.</Typography>
        </Box>
        <Chip
          label={`${sellers.length} vendedores`}
          sx={{
            bgcolor: "rgba(255, 77, 45, 0.14)",
            borderColor: "rgba(255, 77, 45, 0.38)",
            color: "text.primary"
          }}
          variant="outlined"
        />
      </Stack>

      {isError ? <Alert severity="error">Nao foi possivel carregar os vendedores.</Alert> : null}
      {isLoading ? <LoadingState blocks={[{ height: 112 }, { height: 320 }]} /> : null}

      {!isLoading ? (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" }
            }}
          >
            <MetricCard icon={<StorefrontIcon />} label="Vendedores ativos" value={sellers.length} />
            <MetricCard icon={<GroupsIcon />} label="Negocios atribuidos" value={totals.totalCount} />
            <MetricCard icon={<TrendingUpIcon />} label="Negocios abertos" value={totals.openCount} />
            <MetricCard icon={<AttachMoneyIcon />} label="Valor ganho" value={formatCurrency(totals.wonValue)} />
          </Box>

          <Paper elevation={0} sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider", p: { xs: 2, md: 3 } }}>
            <Stack spacing={2}>
              <Typography component="h2" variant="h6">
                Performance comercial
              </Typography>
              {rows.length === 0 ? <EmptyState title="Nenhum vendedor encontrado." /> : null}
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }
                }}
              >
                {rows.map((row) => (
                  <Paper
                    key={row.id}
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
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          aria-hidden
                          sx={{
                            alignItems: "center",
                            bgcolor: "rgba(255, 77, 45, 0.14)",
                            border: 1,
                            borderColor: "rgba(255, 77, 45, 0.34)",
                            borderRadius: 1,
                            color: "primary.main",
                            display: "flex",
                            flexShrink: 0,
                            fontWeight: 900,
                            height: 42,
                            justifyContent: "center",
                            width: 42
                          }}
                        >
                          {row.name.charAt(0)}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={900} noWrap>
                            {row.name}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {row.totalCount} negocio{row.totalCount === 1 ? "" : "s"}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography color="text.secondary" variant="body2">
                            Conversao
                          </Typography>
                          <Typography fontWeight={800} variant="body2">
                            {row.conversionRate}%
                          </Typography>
                        </Stack>
                        <LinearProgress value={row.conversionRate} variant="determinate" />
                      </Stack>

                      <Box
                        sx={{
                          display: "grid",
                          gap: 1,
                          gridTemplateColumns: "repeat(3, minmax(0, 1fr))"
                        }}
                      >
                        <MiniMetric label="Abertos" value={row.openCount} />
                        <MiniMetric label="Ganhos" value={row.wonCount} />
                        <MiniMetric label="Perdidos" value={row.lostCount} />
                      </Box>

                      <Stack spacing={0.5}>
                        <Typography color="primary.main" fontWeight={900}>
                          {formatCurrency(row.wonValue)} ganhos
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {formatCurrency(row.openValue)} em pipeline aberto
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Box>
            </Stack>
          </Paper>
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

const MiniMetric = ({ label, value }: { readonly label: string; readonly value: number }) => (
  <Box sx={{ bgcolor: "rgba(154, 154, 165, 0.08)", border: 1, borderColor: "divider", borderRadius: 1, p: 1 }}>
    <Typography color="text.secondary" variant="caption">
      {label}
    </Typography>
    <Typography fontWeight={900}>{value}</Typography>
  </Box>
);
