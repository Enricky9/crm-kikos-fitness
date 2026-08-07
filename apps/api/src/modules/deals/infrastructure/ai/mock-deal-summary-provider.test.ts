import { describe, expect, it } from "vitest";

import { createMockDealSummaryProvider } from "./mock-deal-summary-provider.js";

describe("mock deal summary provider", () => {
  it("summarizes comments deterministically", async () => {
    const provider = createMockDealSummaryProvider();

    const result = await provider.summarize({
      dealTitle: "Esteiras profissionais",
      leadName: "Carlos Almeida",
      comments: ["Cliente pediu proposta revisada", "Aguardando aprovacao da diretoria"]
    });

    expect(result).toEqual({
      provider: "mock",
      summary:
        'Resumo mock: o negocio "Esteiras profissionais" para Carlos Almeida possui 2 comentario(s). Ultima interacao: Aguardando aprovacao da diretoria'
    });
  });

  it("handles deals without comments", async () => {
    const provider = createMockDealSummaryProvider();

    const result = await provider.summarize({
      dealTitle: "Esteiras profissionais",
      leadName: null,
      comments: []
    });

    expect(result.summary).toContain("ainda nao possui comentarios registrados");
  });
});
