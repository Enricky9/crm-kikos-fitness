import { Skeleton, Stack } from "@mui/material";

type LoadingBlock = {
  readonly height: number;
  readonly width?: number | string;
};

type LoadingStateProps = {
  readonly blocks: readonly LoadingBlock[];
  readonly spacing?: number;
};

export const LoadingState = ({ blocks, spacing = 1.5 }: LoadingStateProps) => (
  <Stack spacing={spacing}>
    {blocks.map((block, index) => (
      <Skeleton height={block.height} key={`${block.height}-${index}`} variant="rounded" width={block.width ?? "100%"} />
    ))}
  </Stack>
);
