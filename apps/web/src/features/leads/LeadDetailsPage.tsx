import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useParams } from "react-router-dom";

import { createCommentSchema, dealStatusLabels, type CreateCommentDto } from "@kikos/shared";

import { HttpError } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import { EmptyState } from "../../ui/EmptyState";
import { LoadingState } from "../../ui/LoadingState";
import { getDealStatusChipSx } from "../../ui/status-chip";
import { formatCurrency, formatDateTime } from "../../utils/format";
import { createLeadCommentRequest, getLeadRequest, listLeadCommentsRequest, listLeadDealsRequest } from "./leads-api";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof HttpError) {
    return error.payload.error.message;
  }

  return fallback;
};

export const LeadDetailsPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const commentForm = useForm<CreateCommentDto>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: ""
    }
  });

  const leadQuery = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => getLeadRequest(token ?? "", leadId ?? ""),
    enabled: Boolean(token && leadId)
  });

  const [commentsQuery, dealsQuery] = useQueries({
    queries: [
      {
        queryKey: ["lead-comments", leadId],
        queryFn: () => listLeadCommentsRequest(token ?? "", leadId ?? ""),
        enabled: Boolean(token && leadId)
      },
      {
        queryKey: ["lead-deals", leadId],
        queryFn: () => listLeadDealsRequest(token ?? "", leadId ?? ""),
        enabled: Boolean(token && leadId)
      }
    ]
  });

  const commentMutation = useMutation({
    mutationFn: (input: CreateCommentDto) => createLeadCommentRequest(token ?? "", leadId ?? "", input),
    onSuccess: () => {
      commentForm.reset({ content: "" });
      void queryClient.invalidateQueries({ queryKey: ["lead-comments", leadId] });
    }
  });

  if (leadQuery.isLoading) {
    return (
      <Stack spacing={2}>
        <LoadingState blocks={[{ height: 48, width: 240 }, { height: 180 }]} />
      </Stack>
    );
  }

  if (leadQuery.isError || !leadQuery.data) {
    return <Alert severity="error">Nao foi possivel carregar o lead.</Alert>;
  }

  const lead = leadQuery.data.lead;
  const submitComment = commentForm.handleSubmit((values) => {
    commentMutation.mutate(values);
  });
  const commentError = commentMutation.error
    ? getErrorMessage(commentMutation.error, "Nao foi possivel adicionar o comentario.")
    : null;

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
        <Stack spacing={1.5}>
          <Button component={RouterLink} startIcon={<ArrowBackIcon />} to="/leads" variant="text">
            Voltar
          </Button>
          <Box>
            <Typography component="h1" variant="h4">
              {lead.name}
            </Typography>
            <Typography color="text.secondary">{lead.company ?? "Sem empresa"}</Typography>
          </Box>
        </Stack>
        <Button component={RouterLink} startIcon={<AddIcon />} to={`/deals/new?leadId=${lead.id}`} variant="contained">
          Criar negocio
        </Button>
      </Stack>

      <Box
        sx={{
          alignItems: "start",
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" }
        }}
      >
        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              boxShadow: "0 18px 44px rgba(0, 0, 0, 0.22)",
              p: { xs: 2, md: 3 }
            }}
          >
            <Stack spacing={2}>
              <Typography component="h2" variant="h6">
                Dados do lead
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }
                }}
              >
                <Info label="E-mail" value={lead.email ?? "-"} />
                <Info label="Telefone" value={lead.phone} />
                <Info label="Origem" value={lead.source ?? "-"} />
                <Info label="Cadastro" value={formatDateTime(lead.createdAt)} />
              </Box>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              p: { xs: 2, md: 3 }
            }}
          >
            <Stack spacing={2}>
              <Typography component="h2" variant="h6">
                Comentarios
              </Typography>
              <Paper
                component="form"
                elevation={0}
                onSubmit={(event) => {
                  void submitComment(event);
                }}
                sx={{ bgcolor: "#111115", border: 1, borderColor: "divider", p: 2 }}
              >
                <Stack spacing={2}>
                  {commentError ? <Alert severity="error">{commentError}</Alert> : null}
                  <Controller
                    control={commentForm.control}
                    name="content"
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        error={Boolean(fieldState.error)}
                        fullWidth
                        helperText={fieldState.error?.message}
                        label="Novo comentario"
                        multiline
                        minRows={3}
                      />
                    )}
                  />
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
                    <Button
                      disabled={commentMutation.isPending}
                      startIcon={commentMutation.isPending ? <SaveIcon /> : <SendIcon />}
                      type="submit"
                      variant="contained"
                    >
                      {commentMutation.isPending ? "Salvando..." : "Adicionar comentario"}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
              {commentsQuery.isLoading ? <LoadingState blocks={[{ height: 96 }]} /> : null}
              {commentsQuery.isError ? <Alert severity="error">Nao foi possivel carregar os comentarios.</Alert> : null}
              {commentsQuery.data?.comments.length === 0 ? (
                <EmptyState
                  description="Use o campo acima para registrar uma interacao com o lead."
                  title="Nenhum comentario registrado."
                />
              ) : null}
              <List disablePadding>
                {commentsQuery.data?.comments.map((comment) => (
                  <ListItem
                    alignItems="flex-start"
                    key={comment.id}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 1,
                      px: 2
                    }}
                  >
                    <ListItemText
                      primary={comment.content}
                      secondary={`${comment.author?.name ?? "Autor"} - ${formatDateTime(comment.createdAt)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Stack>
          </Paper>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            p: { xs: 2, md: 3 },
            position: { lg: "sticky" },
            top: { lg: 24 }
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Typography component="h2" variant="h6">
                Negocios
              </Typography>
              <Chip
                label={dealsQuery.data?.data.length ?? 0}
                size="small"
                sx={{
                  bgcolor: "rgba(255, 77, 45, 0.14)",
                  borderColor: "rgba(255, 77, 45, 0.38)",
                  color: "text.primary",
                  minWidth: 34
                }}
                variant="outlined"
              />
            </Stack>
            {dealsQuery.isLoading ? <LoadingState blocks={[{ height: 96 }]} /> : null}
            {dealsQuery.isError ? <Alert severity="error">Nao foi possivel carregar os negocios.</Alert> : null}
            {dealsQuery.data?.data.length === 0 ? (
              <EmptyState
                description="Crie uma oportunidade a partir deste lead."
                title="Nenhum negocio relacionado."
              />
            ) : null}
            <Stack spacing={1.5}>
              {dealsQuery.data?.data.map((deal) => (
                <Paper
                  key={deal.id}
                  elevation={0}
                  sx={{
                    bgcolor: "#111115",
                    border: 1,
                    borderColor: "divider",
                    p: 2,
                    transition: "border-color 160ms ease, box-shadow 160ms ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: "0 18px 42px rgba(255, 77, 45, 0.14)"
                    }
                  }}
                >
                  <Stack spacing={1.25}>
                    <Box>
                      <Typography fontWeight={700}>{deal.title}</Typography>
                      <Typography color="text.secondary">{formatCurrency(deal.value)}</Typography>
                    </Box>
                    <Chip
                      label={dealStatusLabels[deal.status]}
                      size="small"
                      sx={getDealStatusChipSx(deal.status)}
                      variant="outlined"
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
};

const Info = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <Box
    sx={{
      bgcolor: "#111115",
      border: 1,
      borderColor: "divider",
      borderRadius: 1,
      minWidth: 0,
      p: 1.5
    }}
  >
    <Typography color="text.secondary" variant="body2">
      {label}
    </Typography>
    <Typography fontWeight={700} noWrap>
      {value}
    </Typography>
  </Box>
);
