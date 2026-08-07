export type DealSummaryInput = {
  readonly dealTitle: string;
  readonly leadName: string | null;
  readonly comments: readonly string[];
};

export type DealSummaryProviderResult = {
  readonly summary: string;
  readonly provider: string;
};

export type DealSummaryProvider = {
  readonly summarize: (input: DealSummaryInput) => Promise<DealSummaryProviderResult>;
};
