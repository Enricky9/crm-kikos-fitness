import { Box, Typography } from "@mui/material";

type EmptyStateProps = {
  readonly description?: string;
  readonly minHeight?: number;
  readonly title: string;
};

export const EmptyState = ({ description, minHeight = 112, title }: EmptyStateProps) => (
  <Box
    sx={{
      alignItems: "center",
      bgcolor: "rgba(154, 154, 165, 0.06)",
      border: 1,
      borderColor: "divider",
      borderRadius: 1,
      borderStyle: "dashed",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      minHeight,
      px: 2,
      py: 3,
      textAlign: "center"
    }}
  >
    <Typography fontWeight={700}>{title}</Typography>
    {description ? (
      <Typography color="text.secondary" variant="body2">
        {description}
      </Typography>
    ) : null}
  </Box>
);
