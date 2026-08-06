import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FF4D2D",
      contrastText: "#FFFFFF"
    },
    secondary: {
      main: "#9A9AA5"
    },
    background: {
      default: "#0B0B0D",
      paper: "#17171F"
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#9A9AA5"
    },
    divider: "#2A2A36"
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: ["Inter", "Roboto", "Arial", "sans-serif"].join(","),
    h4: {
      fontSize: "1.75rem",
      fontWeight: 800,
      lineHeight: 1.2
    },
    h5: {
      fontWeight: 800
    },
    h6: {
      fontWeight: 750
    },
    button: {
      fontWeight: 700,
      textTransform: "none"
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0B0B0D"
        },
        "*": {
          scrollbarColor: "#2A2A36 #0B0B0D"
        },
        "*::-webkit-scrollbar": {
          width: 10,
          height: 10
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "#2A2A36",
          borderRadius: 8
        },
        "*::-webkit-scrollbar-track": {
          backgroundColor: "#0B0B0D"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          minHeight: 40
        },
        contained: {
          "&:hover": {
            boxShadow: "0 10px 28px rgba(255, 77, 45, 0.28)"
          }
        },
        outlined: {
          borderColor: "#2A2A36",
          color: "#FFFFFF",
          "&:hover": {
            borderColor: "#FF4D2D",
            backgroundColor: "rgba(255, 77, 45, 0.08)"
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#17171F",
          borderColor: "#2A2A36"
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined"
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#0E0E12",
          borderRadius: 8,
          "& fieldset": {
            borderColor: "#2A2A36"
          },
          "&:hover fieldset": {
            borderColor: "#FF4D2D"
          },
          "&.Mui-focused fieldset": {
            borderColor: "#FF4D2D"
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#9A9AA5",
          "&.Mui-focused": {
            color: "#FF4D2D"
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#2A2A36"
        },
        head: {
          color: "#9A9AA5",
          fontSize: "0.75rem",
          fontWeight: 800,
          textTransform: "uppercase"
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#111115",
          backgroundImage: "none",
          borderColor: "#2A2A36"
        }
      }
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.08)"
        }
      }
    }
  }
});
