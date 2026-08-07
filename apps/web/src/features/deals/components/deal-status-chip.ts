import type { DealStatus } from "@kikos/shared";
import type { SxProps, Theme } from "@mui/material";

const dealStatusStyle: Record<DealStatus, { readonly bg: string; readonly border: string; readonly color: string }> = {
  NEW: {
    bg: "rgba(154, 154, 165, 0.12)",
    border: "rgba(154, 154, 165, 0.32)",
    color: "#D7D7DE"
  },
  IN_PROGRESS: {
    bg: "rgba(255, 77, 45, 0.14)",
    border: "rgba(255, 77, 45, 0.42)",
    color: "#FFB8A8"
  },
  PROPOSAL: {
    bg: "rgba(111, 168, 255, 0.14)",
    border: "rgba(111, 168, 255, 0.36)",
    color: "#B8D3FF"
  },
  WON: {
    bg: "rgba(61, 220, 151, 0.14)",
    border: "rgba(61, 220, 151, 0.38)",
    color: "#9FF0CC"
  },
  LOST: {
    bg: "rgba(255, 99, 99, 0.14)",
    border: "rgba(255, 99, 99, 0.38)",
    color: "#FFB3B3"
  }
};

export const getDealStatusChipSx = (status: DealStatus): SxProps<Theme> => ({
  bgcolor: dealStatusStyle[status].bg,
  borderColor: dealStatusStyle[status].border,
  color: dealStatusStyle[status].color
});
