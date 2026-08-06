import DashboardIcon from "@mui/icons-material/Dashboard";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import GroupsIcon from "@mui/icons-material/Groups";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { Link as RouterLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../auth/AuthContext";
import { CreateDealPage } from "../features/deals/CreateDealPage";
import { DealBoardPage } from "../features/deals/DealBoardPage";
import { DealDetailsPage } from "../features/deals/DealDetailsPage";
import { CreateLeadPage } from "../features/leads/CreateLeadPage";
import { LeadDetailsPage } from "../features/leads/LeadDetailsPage";
import { LeadListPage } from "../features/leads/LeadListPage";

const sidebarWidth = 264;

const navigationItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon fontSize="small" /> },
  { label: "Leads", path: "/leads", icon: <GroupsIcon fontSize="small" /> },
  { label: "Negocios", path: "/deals/board", icon: <ViewKanbanIcon fontSize="small" /> },
  { label: "Vendedores", path: "/sellers", icon: <StorefrontIcon fontSize="small" /> }
] as const;

export const AppShell = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    auth.logout();
    void navigate("/login", { replace: true });
  };

  const sidebar = (
    <Stack height="100%" spacing={3} sx={{ px: 2.5, py: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "primary.main",
            color: "primary.contrastText"
          }}
        >
          <FitnessCenterIcon />
        </Box>
        <Box>
          <Typography fontWeight={900}>Kikos CRM</Typography>
          <Typography color="text.secondary" variant="body2">
            Comercial
          </Typography>
        </Box>
      </Stack>

      <List disablePadding sx={{ flexGrow: 1 }}>
        {navigationItems.map((item) => {
          const isSelected =
            location.pathname === item.path ||
            (item.path === "/deals/board" && location.pathname.startsWith("/deals"));

          return (
            <ListItemButton
              component={RouterLink}
              key={item.path}
              onClick={() => {
                setMobileOpen(false);
              }}
              selected={isSelected}
              sx={{
                borderRadius: 2,
                mb: 0.75,
                minHeight: 46,
                color: isSelected ? "text.primary" : "text.secondary",
                "&.Mui-selected": {
                  bgcolor: "rgba(255, 77, 45, 0.14)",
                  color: "text.primary",
                  boxShadow: "inset 0 0 0 1px rgba(255, 77, 45, 0.36)"
                },
                "&.Mui-selected:hover, &:hover": {
                  bgcolor: "rgba(255, 77, 45, 0.1)"
                }
              }}
              to={item.path}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: isSelected ? 800 : 650 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 38, height: 38 }}>
          {auth.user?.name?.charAt(0) ?? "K"}
        </Avatar>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography noWrap fontWeight={800} variant="body2">
            {auth.user?.name}
          </Typography>
          <Typography noWrap color="text.secondary" variant="caption">
            {auth.user?.role === "ADMIN" ? "Administrador" : "Vendedor"}
          </Typography>
        </Box>
        <IconButton aria-label="Sair" color="inherit" onClick={handleLogout} size="small">
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  );

  return (
    <Box minHeight="100vh" bgcolor="background.default">
      <Drawer
        ModalProps={{ keepMounted: true }}
        onClose={() => {
          setMobileOpen(false);
        }}
        open={mobileOpen}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { width: sidebarWidth }
        }}
        variant="temporary"
      >
        {sidebar}
      </Drawer>

      <Drawer
        open
        sx={{
          display: { xs: "none", lg: "block" },
          width: sidebarWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            boxSizing: "border-box"
          }
        }}
        variant="permanent"
      >
        {sidebar}
      </Drawer>

      <Box sx={{ minHeight: "100vh", pl: { lg: `${sidebarWidth}px` } }}>
        {!isDesktop ? (
          <AppBar position="sticky" color="inherit" elevation={0}>
            <Toolbar sx={{ gap: 2, borderBottom: 1, borderColor: "divider", bgcolor: "#111115" }}>
              <IconButton
                aria-label="Abrir menu"
                color="inherit"
                onClick={() => {
                  setMobileOpen(true);
                }}
              >
                <MenuIcon />
              </IconButton>
              <PointOfSaleIcon color="primary" />
              <Typography component="div" variant="h6" sx={{ flexGrow: 1 }}>
                Kikos CRM
              </Typography>
              <Button aria-label="Sair" onClick={handleLogout} startIcon={<LogoutIcon fontSize="small" />} variant="outlined">
                Sair
              </Button>
            </Toolbar>
          </AppBar>
        ) : null}

        <Box
          component="main"
          sx={{
            px: { xs: 2, md: 3, xl: 4 },
            py: { xs: 2, md: 4 },
            mx: "auto",
            maxWidth: 1680
          }}
        >
        <Routes>
          <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
          <Route path="/deals/board" element={<DealBoardPage />} />
          <Route path="/deals/new" element={<CreateDealPage />} />
          <Route path="/deals/:dealId" element={<DealDetailsPage />} />
          <Route path="/leads" element={<LeadListPage />} />
          <Route path="/leads/new" element={<CreateLeadPage />} />
          <Route path="/leads/:leadId" element={<LeadDetailsPage />} />
          <Route path="/sellers" element={<Placeholder title="Vendedores" />} />
          <Route path="*" element={<Placeholder title="Pagina nao encontrada" />} />
        </Routes>
        </Box>
      </Box>
    </Box>
  );
};

const Placeholder = ({ title }: { readonly title: string }) => (
  <Stack spacing={1}>
    <Typography component="h1" variant="h4">
      {title}
    </Typography>
    <Typography color="text.secondary">Esta area sera refinada nas proximas etapas visuais do CRM.</Typography>
  </Stack>
);
