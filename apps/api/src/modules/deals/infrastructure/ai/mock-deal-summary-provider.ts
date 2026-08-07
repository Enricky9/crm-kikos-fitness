import type { DealSummaryProvider } from "../../application/ports/deal-summary-provider.js";

export const createMockDealSummaryProvider = (): DealSummaryProvider => ({
  summarize: ({ dealTitle, leadName, comments }) => {
    const leadLabel = leadName ? ` para ${leadName}` : "";

    if (comments.length === 0) {
      return Promise.resolve({
        provider: "mock",
        summary: `Resumo mock: o negocio "${dealTitle}"${leadLabel} ainda nao possui comentarios registrados.`
      });
    }

    const latestComment = comments[comments.length - 1];

    return Promise.resolve({
      provider: "mock",
      summary: `Resumo mock: o negocio "${dealTitle}"${leadLabel} possui ${comments.length} comentario(s). Ultima interacao: ${latestComment}`
    });
  }
});
