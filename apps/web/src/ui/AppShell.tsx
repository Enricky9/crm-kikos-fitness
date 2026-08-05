import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import GroupsIcon from "@mui/icons-material/Groups";
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
import { Link as RouterLink, Route, Routes } from "react-router-dom";

const navigationItems = [
  { label: "Board", path: "/deals/board", icon: <ViewKanbanIcon fontSize="small" /> },
  { label: "Leads", path: "/leads", icon: <GroupsIcon fontSize="small" /> }
] as const;

export const AppShell = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box minHeight="100vh" bgcolor="background.default">
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar sx={{ gap: 2, borderBottom: 1, borderColor: "divider" }}>
          <FitnessCenterIcon color="primary" />
          <Typography component="div" variant="h6" sx={{ flexGrow: 1 }}>
            Kikos CRM
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
          </Stack>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="xl" sx={{ py: 4 }}>
        <Routes>
          <Route path="/deals/board" element={<Placeholder title="Funil comercial" />} />
          <Route path="/leads" element={<Placeholder title="Leads" />} />
        </Routes>
      </Container>
    </Box>
  );
};

const Placeholder = ({ title }: { title: string }) => (
  <Stack spacing={1}>
    <Typography component="h1" variant="h4">
      {title}
    </Typography>
    <Typography color="text.secondary">
      Esta área será implementada nas próximas etapas do CRM.
    </Typography>
  </Stack>
);
