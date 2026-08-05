import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
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
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { formatDateTime } from "../../utils/format";
import { listLeadsRequest } from "./leads-api";

const pageSizeOptions = [10, 20, 50];

export const LeadListPage = () => {
  const { token } = useAuth();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const leadsQuery = useQuery({
    queryKey: ["leads", { page, pageSize, search }],
    queryFn: () =>
      listLeadsRequest(token ?? "", {
        page: page + 1,
        pageSize,
        search: search || undefined,
        sortBy: "createdAt",
        sortOrder: "desc"
      }),
    enabled: Boolean(token),
    placeholderData: keepPreviousData
  });

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
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
        <Button component={RouterLink} startIcon={<AddIcon />} to="/leads/new" variant="contained">
          Criar lead
        </Button>
      </Stack>

      <Paper
        component="form"
        onSubmit={handleSearchSubmit}
        elevation={0}
        sx={{ border: 1, borderColor: "divider", p: 2 }}
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

      <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: "divider" }}>
        <Table>
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
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {leadsQuery.data?.data.map((lead) => (
              <TableRow hover key={lead.id}>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.email ?? "-"}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>{lead.company ?? "-"}</TableCell>
                <TableCell align="right">{lead.dealsCount}</TableCell>
                <TableCell>{formatDateTime(lead.createdAt)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Abrir detalhes">
                    <IconButton component={RouterLink} to={`/leads/${lead.id}`} aria-label="Abrir detalhes">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {leadsQuery.data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box py={4} textAlign="center">
                    <Typography color="text.secondary">Nenhum lead encontrado.</Typography>
                  </Box>
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
          rowsPerPageOptions={pageSizeOptions}
        />
      </TableContainer>
    </Stack>
  );
};
