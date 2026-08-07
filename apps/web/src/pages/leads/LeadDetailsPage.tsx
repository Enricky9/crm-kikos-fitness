import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  Button,
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

import { createCommentSchema, type CreateCommentDto } from "@kikos/shared";

import { useAuth } from "../../features/auth/AuthContext";
import { LeadDealsPanel } from "../../features/leads/components/lead-deals-panel";
import { LeadDetailsSummary } from "../../features/leads/components/lead-details-summary";
import { createLeadCommentRequest, getLeadRequest, listLeadCommentsRequest, listLeadDealsRequest } from "../../features/leads/api/leads-api";
import { HttpError } from "../../shared/api/http";
import { EmptyState } from "../../shared/components/EmptyState";
import { LoadingState } from "../../shared/components/LoadingState";
import { formatDateTime } from "../../shared/utils/format";

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
          <LeadDetailsSummary lead={lead} />

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

        <LeadDealsPanel deals={dealsQuery.data?.data ?? []} isError={dealsQuery.isError} isLoading={dealsQuery.isLoading} />
      </Box>
    </Stack>
  );
};
