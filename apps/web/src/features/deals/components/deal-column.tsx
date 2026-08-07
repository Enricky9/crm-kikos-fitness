import { useDroppable } from "@dnd-kit/core";
import { Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import type { DealDto, DealStatus } from "@kikos/shared";
import { dealStatusLabels } from "@kikos/shared";

import { EmptyState } from "../../../shared/components/EmptyState";
import { LoadingState } from "../../../shared/components/LoadingState";
import { DealCard } from "./deal-card";

type DealColumnProps = {
  readonly deals: readonly DealDto[];
  readonly isLoading: boolean;
  readonly onStatusChange: (deal: DealDto, status: DealStatus) => void;
  readonly status: DealStatus;
  readonly statusMutationPending: boolean;
};

export const DealColumn = ({ deals, isLoading, onStatusChange, status, statusMutationPending }: DealColumnProps) => {
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

const ColumnSkeleton = () => <LoadingState blocks={[{ height: 128 }, { height: 128 }]} />;
