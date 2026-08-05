import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "./AuthContext";

export const RequireAuth = () => {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === "loading") {
    return (
      <Box minHeight="100vh" display="grid" sx={{ placeItems: "center" }}>
        <CircularProgress aria-label="Carregando sessao" />
      </Box>
    );
  }

  if (auth.status !== "authenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
