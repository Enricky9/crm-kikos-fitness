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
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
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
        <Skeleton width={240} height={48} />
        <Skeleton variant="rectangular" height={180} />
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
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={2} alignItems="center">
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

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            Dados do lead
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Info label="E-mail" value={lead.email ?? "-"} />
            <Info label="Telefone" value={lead.phone} />
            <Info label="Origem" value={lead.source ?? "-"} />
            <Info label="Cadastro" value={formatDateTime(lead.createdAt)} />
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            Negocios relacionados
          </Typography>
          {dealsQuery.isLoading ? <Skeleton variant="rectangular" height={96} /> : null}
          {dealsQuery.isError ? <Alert severity="error">Nao foi possivel carregar os negocios.</Alert> : null}
          {dealsQuery.data?.data.length === 0 ? (
            <Typography color="text.secondary">Nenhum negocio relacionado.</Typography>
          ) : null}
          <Stack spacing={1.5}>
            {dealsQuery.data?.data.map((deal) => (
              <Paper key={deal.id} elevation={0} sx={{ border: 1, borderColor: "divider", p: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between">
                  <Box>
                    <Typography fontWeight={700}>{deal.title}</Typography>
                    <Typography color="text.secondary">{formatCurrency(deal.value)}</Typography>
                  </Box>
                  <Chip label={dealStatusLabels[deal.status]} />
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: { xs: 2, md: 3 } }}>
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
            sx={{ border: 1, borderColor: "divider", p: 2 }}
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
              <Button
                disabled={commentMutation.isPending}
                startIcon={commentMutation.isPending ? <SaveIcon /> : <SendIcon />}
                type="submit"
                variant="contained"
              >
                {commentMutation.isPending ? "Salvando..." : "Adicionar comentario"}
              </Button>
            </Stack>
          </Paper>
          {commentsQuery.isLoading ? <Skeleton variant="rectangular" height={96} /> : null}
          {commentsQuery.isError ? <Alert severity="error">Nao foi possivel carregar os comentarios.</Alert> : null}
          {commentsQuery.data?.comments.length === 0 ? (
            <Typography color="text.secondary">Nenhum comentario registrado.</Typography>
          ) : null}
          <List disablePadding>
            {commentsQuery.data?.comments.map((comment, index) => (
              <Box key={comment.id}>
                {index > 0 ? <Divider /> : null}
                <ListItem disableGutters alignItems="flex-start">
                  <ListItemText
                    primary={comment.content}
                    secondary={`${comment.author?.name ?? "Autor"} - ${formatDateTime(comment.createdAt)}`}
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        </Stack>
      </Paper>
    </Stack>
  );
};

const Info = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <Box minWidth={160}>
    <Typography color="text.secondary" variant="body2">
      {label}
    </Typography>
    <Typography fontWeight={700}>{value}</Typography>
  </Box>
);
