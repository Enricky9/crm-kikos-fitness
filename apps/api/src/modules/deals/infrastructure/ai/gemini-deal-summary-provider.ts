import type { DealSummaryProvider } from "../../application/ports/deal-summary-provider.js";

type GeminiGenerateContentResponse = {
  readonly candidates?: readonly {
    readonly content?: {
      readonly parts?: readonly {
        readonly text?: string;
      }[];
    };
  }[];
};

const buildPrompt = ({
  dealTitle,
  leadName,
  comments
}: {
  readonly dealTitle: string;
  readonly leadName: string | null;
  readonly comments: readonly string[];
}) => {
  const formattedComments =
    comments.length > 0
      ? comments.map((comment, index) => `${index + 1}. ${comment}`).join("\n")
      : "Nenhum comentario registrado.";

  return [
    "Voce e um assistente de CRM da Kikos Fitness.",
    "Resuma os comentarios do negocio de forma objetiva para um vendedor.",
    "Retorne apenas o resumo em portugues do Brasil, com no maximo 5 linhas.",
    "",
    `Negocio: ${dealTitle}`,
    `Lead: ${leadName ?? "Nao informado"}`,
    "",
    "Comentarios:",
    formattedComments
  ].join("\n");
};

export const createGeminiDealSummaryProvider = ({
  apiKey,
  model,
  timeoutMs
}: {
  readonly apiKey: string;
  readonly model: string;
  readonly timeoutMs: number;
}): DealSummaryProvider => ({
  summarize: async (input) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: buildPrompt(input) }]
              }
            ],
            generationConfig: {
              maxOutputTokens: 300,
              temperature: 0.2
            }
          }),
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },
          method: "POST",
          signal: controller.signal
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as GeminiGenerateContentResponse;
      const summary = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!summary) {
        throw new Error("Gemini response did not include a summary");
      }

      return {
        provider: "gemini",
        summary
      };
    } finally {
      clearTimeout(timeout);
    }
  }
});
