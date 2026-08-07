import type { DealAiSummaryDto } from "@kikos/shared";

export type DealAiSummaryViewState =
  | {
      readonly actionLabel: "Gerando...";
      readonly status: "loading";
    }
  | {
      readonly actionLabel: "Tentar novamente";
      readonly errorMessage: string;
      readonly status: "error";
    }
  | {
      readonly actionLabel: "Gerar novamente";
      readonly summary: DealAiSummaryDto;
      readonly status: "success";
    }
  | {
      readonly actionLabel: "Gerar resumo com IA";
      readonly status: "idle";
    };

export const getDealAiSummaryViewState = ({
  errorMessage,
  isPending,
  summary
}: {
  readonly errorMessage: string | null;
  readonly isPending: boolean;
  readonly summary: DealAiSummaryDto | null;
}): DealAiSummaryViewState => {
  if (isPending) {
    return {
      actionLabel: "Gerando...",
      status: "loading"
    };
  }

  if (errorMessage) {
    return {
      actionLabel: "Tentar novamente",
      errorMessage,
      status: "error"
    };
  }

  if (summary) {
    return {
      actionLabel: "Gerar novamente",
      status: "success",
      summary
    };
  }

  return {
    actionLabel: "Gerar resumo com IA",
    status: "idle"
  };
};
