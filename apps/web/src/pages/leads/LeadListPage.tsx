import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { useAuth } from "../../features/auth/AuthContext";
import { getLeadInitials, leadPageSizeOptions, useLeadList } from "../../features/leads/hooks/use-lead-list";
import { EmptyState } from "../../shared/components/EmptyState";
import { formatDateTime } from "../../shared/utils/format";

export const LeadListPage = () => {
  const { token } = useAuth();
  const { leadsQuery, page, pageSize, searchInput, setPage, setPageSize, setSearchInput, submitSearch } = useLeadList(token);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch();
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography component="h1" variant="h4">
            Leads
          </Typography>
          <Typography color="text.secondary">Relacionamentos comerciais em andamento.</Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
          <Chip
            label={`${leadsQuery.data?.pagination.total ?? 0} leads`}
            sx={{
              bgcolor: "rgba(255, 77, 45, 0.14)",
              borderColor: "rgba(255, 77, 45, 0.38)",
              color: "text.primary"
            }}
            variant="outlined"
          />
          <Button component={RouterLink} startIcon={<AddIcon />} to="/leads/new" variant="contained">
            Criar lead
          </Button>
        </Stack>
      </Stack>

      <Paper
        component="form"
        onSubmit={handleSearchSubmit}
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          p: { xs: 1.5, md: 2 }
        }}
      >
        <TextField
          fullWidth
          label="Buscar"
          onChange={(event) => setSearchInput(event.target.value)}
          value={searchInput}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="Buscar leads" edge="end" type="submit">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {leadsQuery.isError ? (
        <Alert severity="error">Nao foi possivel carregar os leads.</Alert>
      ) : null}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          overflowX: "auto"
        }}
      >
        <Table sx={{ minWidth: 920 }}>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>E-mail</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell align="right">Negocios</TableCell>
              <TableCell>Cadastro</TableCell>
              <TableCell align="right">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leadsQuery.isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton height={28} variant="rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {leadsQuery.data?.data.map((lead) => (
              <TableRow
                hover
                key={lead.id}
                sx={{
                  transition: "background-color 160ms ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 77, 45, 0.06)"
                  }
                }}
              >
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      aria-hidden
                      sx={{
                        alignItems: "center",
                        bgcolor: "rgba(255, 77, 45, 0.14)",
                        border: 1,
                        borderColor: "rgba(255, 77, 45, 0.34)",
                        borderRadius: 1,
                        color: "primary.main",
                        display: "flex",
                        flexShrink: 0,
                        fontSize: 12,
                        fontWeight: 800,
                        height: 36,
                        justifyContent: "center",
                        width: 36
                      }}
                    >
                      {getLeadInitials(lead.name)}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>
                        {lead.name}
                      </Typography>
                      <Typography color="text.secondary" noWrap variant="body2">
                        {lead.source ?? "Origem nao informada"}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell sx={{ color: lead.email ? "text.primary" : "text.secondary" }}>{lead.email ?? "-"}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell sx={{ color: lead.company ? "text.primary" : "text.secondary" }}>
                  {lead.company ?? "-"}
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={lead.dealsCount}
                    size="small"
                    sx={{
                      bgcolor: "rgba(154, 154, 165, 0.12)",
                      borderColor: "rgba(154, 154, 165, 0.3)",
                      color: "text.primary",
                      minWidth: 34
                    }}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell sx={{ color: "text.secondary" }}>{formatDateTime(lead.createdAt)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Abrir detalhes">
                    <IconButton
                      component={RouterLink}
                      to={`/leads/${lead.id}`}
                      aria-label="Abrir detalhes"
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        color: "text.secondary",
                        "&:hover": {
                          borderColor: "primary.main",
                          color: "primary.main"
                        }
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {leadsQuery.data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    description="Ajuste a busca ou crie um novo lead."
                    minHeight={140}
                    title="Nenhum lead encontrado."
                  />
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={leadsQuery.data?.pagination.total ?? 0}
          labelRowsPerPage="Linhas por pagina"
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setPage(0);
            setPageSize(Number(event.target.value));
          }}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={leadPageSizeOptions}
        />
      </TableContainer>
    </Stack>
  );
};
