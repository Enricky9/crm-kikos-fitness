import type { AuthenticatedUser, CommentDto } from "@kikos/shared";

import { CommentModel, DealModel, LeadModel, UserModel } from "../../../../../shared/database/models/index.js";
import type { CommentRepository } from "../../../application/ports/comment-repository.js";

const includeAuthor = [{ model: UserModel, as: "author", attributes: ["id", "name", "email"], required: false }];

const toCommentDto = (comment: CommentModel): CommentDto => {
  const author = comment.get("author") as UserModel | undefined;

  return {
    id: comment.id,
    content: comment.content,
    authorId: comment.authorId,
    leadId: comment.leadId,
    dealId: comment.dealId,
    createdAt: comment.createdAt.toISOString(),
    author: author
      ? {
          id: author.id,
          name: author.name,
          email: author.email
        }
      : null
  };
};

const findScopedDeal = (dealId: string, user: AuthenticatedUser) =>
  DealModel.findOne({
    where: {
      id: dealId,
      ...(user.role === "SELLER" ? { sellerId: user.id } : {})
    }
  });

export const createSequelizeCommentRepository = (): CommentRepository => ({
  listByLead: async (leadId) => {
    const lead = await LeadModel.findByPk(leadId);

    if (!lead) {
      return null;
    }

    const comments = await CommentModel.findAll({
      where: { leadId },
      include: includeAuthor,
      order: [["created_at", "ASC"]]
    });

    return comments.map(toCommentDto);
  },

  createForLead: async (leadId, input, authorId) => {
    const lead = await LeadModel.findByPk(leadId);

    if (!lead) {
      return null;
    }

    const comment = await CommentModel.create({
      content: input.content.trim(),
      authorId,
      leadId,
      dealId: null
    });

    const persistedComment = await CommentModel.findByPk(comment.id, {
      include: includeAuthor
    });

    return toCommentDto(persistedComment ?? comment);
  },

  listByDeal: async (dealId, user) => {
    const deal = await findScopedDeal(dealId, user);

    if (!deal) {
      return null;
    }

    const comments = await CommentModel.findAll({
      where: { dealId },
      include: includeAuthor,
      order: [["created_at", "ASC"]]
    });

    return comments.map(toCommentDto);
  },

  createForDeal: async (dealId, input, user) => {
    const deal = await findScopedDeal(dealId, user);

    if (!deal) {
      return null;
    }

    const comment = await CommentModel.create({
      content: input.content.trim(),
      authorId: user.id,
      leadId: null,
      dealId
    });

    const persistedComment = await CommentModel.findByPk(comment.id, {
      include: includeAuthor
    });

    return toCommentDto(persistedComment ?? comment);
  }
});
