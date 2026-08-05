import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import GroupsIcon from "@mui/icons-material/Groups";
import LogoutIcon from "@mui/icons-material/Logout";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { Link as RouterLink, Route, Routes, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { DealBoardPage } from "../features/deals/DealBoardPage";
import { CreateLeadPage } from "../features/leads/CreateLeadPage";
import { LeadDetailsPage } from "../features/leads/LeadDetailsPage";
import { LeadListPage } from "../features/leads/LeadListPage";

const navigationItems = [
  { label: "Board", path: "/deals/board", icon: <ViewKanbanIcon fontSize="small" /> },
  { label: "Leads", path: "/leads", icon: <GroupsIcon fontSize="small" /> }
] as const;

export const AppShell = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    void navigate("/login", { replace: true });
  };

  return (
    <Box minHeight="100vh" bgcolor="background.default">
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar sx={{ gap: 2, borderBottom: 1, borderColor: "divider" }}>
          <FitnessCenterIcon color="primary" />
          <Typography component="div" variant="h6" sx={{ flexGrow: 1 }}>
            Kikos CRM
          </Typography>
          <Typography color="text.secondary" sx={{ display: { xs: "none", md: "block" } }}>
            {auth.user?.name}
          </Typography>
          <Stack direction="row" spacing={1}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                startIcon={isSmallScreen ? undefined : item.icon}
                to={item.path}
                variant="text"
              >
                {isSmallScreen ? item.icon : item.label}
              </Button>
            ))}
            <Button
              aria-label="Sair"
              onClick={handleLogout}
              startIcon={isSmallScreen ? undefined : <LogoutIcon fontSize="small" />}
              variant="outlined"
            >
              {isSmallScreen ? <LogoutIcon fontSize="small" /> : "Sair"}
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="xl" sx={{ py: 4 }}>
        <Routes>
          <Route path="/deals/board" element={<DealBoardPage />} />
          <Route path="/deals/new" element={<Placeholder title="Criar negocio" />} />
          <Route path="/leads" element={<LeadListPage />} />
          <Route path="/leads/new" element={<CreateLeadPage />} />
          <Route path="/leads/:leadId" element={<LeadDetailsPage />} />
        </Routes>
      </Container>
    </Box>
  );
};

const Placeholder = ({ title }: { readonly title: string }) => (
  <Stack spacing={1}>
    <Typography component="h1" variant="h4">
      {title}
    </Typography>
    <Typography color="text.secondary">Esta area sera implementada nas proximas etapas do CRM.</Typography>
  </Stack>
);
