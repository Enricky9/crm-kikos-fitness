import { describe, expect, it } from "vitest";

import { getDealAiSummaryViewState } from "./deal-ai-summary";

describe("Deal AI summary state", () => {
  it("prioriza loading", () => {
    expect(
      getDealAiSummaryViewState({
        errorMessage: null,
        isPending: true,
        summary: null
      })
    ).toEqual({
      actionLabel: "Gerando...",
      status: "loading"
    });
  });

  it("exibe erro quando a geracao falha", () => {
    expect(
      getDealAiSummaryViewState({
        errorMessage: "Nao foi possivel gerar o resumo.",
        isPending: false,
        summary: null
      })
    ).toEqual({
      actionLabel: "Tentar novamente",
      errorMessage: "Nao foi possivel gerar o resumo.",
      status: "error"
    });
  });

  it("exibe sucesso quando existe resumo", () => {
    const summary = {
      generatedAt: "2026-08-07T19:00:00.000Z",
      provider: "mock",
      summary: "Cliente aguarda proposta revisada."
    };

    expect(
      getDealAiSummaryViewState({
        errorMessage: null,
        isPending: false,
        summary
      })
    ).toEqual({
      actionLabel: "Gerar novamente",
      status: "success",
      summary
    });
  });
});
