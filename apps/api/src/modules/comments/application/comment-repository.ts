import type { AuthenticatedUser, CommentDto, CreateCommentDto } from "@kikos/shared";

export type CommentRepository = {
  readonly listByLead: (leadId: string) => Promise<readonly CommentDto[] | null>;
  readonly createForLead: (
    leadId: string,
    input: CreateCommentDto,
    authorId: string
  ) => Promise<CommentDto | null>;
  readonly listByDeal: (dealId: string, user: AuthenticatedUser) => Promise<readonly CommentDto[] | null>;
  readonly createForDeal: (
    dealId: string,
    input: CreateCommentDto,
    user: AuthenticatedUser
  ) => Promise<CommentDto | null>;
};
