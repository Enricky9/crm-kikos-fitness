import { Op, type InferAttributes, type WhereOptions } from "sequelize";

import type {
  AuthenticatedUser,
  DealDto,
  DealListQuery,
  DealStatus,
} from "@kikos/shared";

import { DealModel, DealStatusHistoryModel, LeadModel, UserModel } from "../../../shared/database/models/index.js";
import { sequelize } from "../../../shared/database/sequelize.js";
import { LeadNotFoundError, SellerNotFoundError } from "../../../shared/errors/app-error.js";
import { isClosedDealStatus } from "../domain/deal-transitions.js";
import type { DealRepository } from "../application/deal-repository.js";

const includeRelations = [
  { model: LeadModel, as: "lead", attributes: ["id", "name", "company"], required: false },
  { model: UserModel, as: "seller", attributes: ["id", "name", "email"], required: false }
];

const toDealDto = (deal: DealModel): DealDto => {
  const lead = deal.get("lead") as LeadModel | undefined;
  const seller = deal.get("seller") as UserModel | undefined;

  return {
    id: deal.id,
    title: deal.title,
    description: deal.description,
    value: deal.value,
    status: deal.status,
    leadId: deal.leadId,
    sellerId: deal.sellerId,
    lostReason: deal.lostReason,
    closedAt: deal.closedAt?.toISOString() ?? null,
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
    lead: lead
      ? {
          id: lead.id,
          name: lead.name,
          company: lead.company
        }
      : null,
    seller: seller
      ? {
          id: seller.id,
          name: seller.name,
          email: seller.email
        }
      : null
  };
};

const normalizeOptionalText = (value: string | null | undefined) => {
  if (value === undefined) {
    return undefined;
  }

  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
};

const buildScopedWhere = (
  query: DealListQuery,
  user: AuthenticatedUser
): WhereOptions<InferAttributes<DealModel>> => {
  const where: WhereOptions<InferAttributes<DealModel>> = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.leadId) {
    where.leadId = query.leadId;
  }

  if (query.search) {
    where.title = { [Op.iLike]: `%${query.search.trim()}%` };
  }

  if (user.role === "SELLER") {
    where.sellerId = user.id;
  } else if (query.sellerId) {
    where.sellerId = query.sellerId;
  }

  return where;
};

const findDealById = (dealId: string, user: AuthenticatedUser) =>
  DealModel.findOne({
    where: {
      id: dealId,
      ...(user.role === "SELLER" ? { sellerId: user.id } : {})
    },
    include: includeRelations
  });

const updateStatusInTransaction = async (
  deal: DealModel,
  toStatus: DealStatus,
  changedBy: string,
  lostReason: string | null
) =>
  sequelize.transaction(async (transaction) => {
    const fromStatus = deal.status;
    const closedAt = isClosedDealStatus(toStatus) ? new Date() : null;

    await deal.update(
      {
        status: toStatus,
        closedAt,
        lostReason: toStatus === "LOST" ? lostReason : null
      },
      { transaction }
    );

    if (fromStatus !== toStatus) {
      await DealStatusHistoryModel.create(
        {
          dealId: deal.id,
          fromStatus,
          toStatus,
          changedBy
        },
        { transaction }
      );
    }

    const updatedDeal = await DealModel.findByPk(deal.id, {
      include: includeRelations,
      transaction
    });

    return updatedDeal ? toDealDto(updatedDeal) : null;
  });

const assertLeadExists = async (leadId: string) => {
  const lead = await LeadModel.findByPk(leadId);

  if (!lead) {
    throw new LeadNotFoundError();
  }
};

const assertSellerExists = async (sellerId: string) => {
  const seller = await UserModel.findOne({ where: { id: sellerId, role: "SELLER" } });

  if (!seller) {
    throw new SellerNotFoundError();
  }
};

export const createSequelizeDealRepository = (): DealRepository => ({
  list: async (query, user) => {
    const offset = (query.page - 1) * query.pageSize;
    const where = buildScopedWhere(query, user);
    const { rows, count } = await DealModel.findAndCountAll({
      where,
      include: includeRelations,
      order: [["updated_at", "DESC"]],
      limit: query.pageSize,
      offset
    });

    return {
      data: rows.map(toDealDto),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: count,
        totalPages: Math.ceil(count / query.pageSize)
      }
    };
  },

  create: async (input, changedBy) =>
    sequelize.transaction(async (transaction) => {
      await assertLeadExists(input.leadId);
      await assertSellerExists(input.sellerId);

      const deal = await DealModel.create(
        {
          title: input.title.trim(),
          description: normalizeOptionalText(input.description) ?? null,
          value: input.value.toFixed(2),
          status: input.status,
          leadId: input.leadId,
          sellerId: input.sellerId,
          lostReason: null,
          closedAt: null
        },
        { transaction }
      );

      await DealStatusHistoryModel.create(
        {
          dealId: deal.id,
          fromStatus: null,
          toStatus: deal.status,
          changedBy
        },
        { transaction }
      );

      const persistedDeal = await DealModel.findByPk(deal.id, {
        include: includeRelations,
        transaction
      });

      return toDealDto(persistedDeal ?? deal);
    }),

  findById: async (dealId, user) => {
    const deal = await findDealById(dealId, user);
    return deal ? toDealDto(deal) : null;
  },

  update: async (dealId, input, user) => {
    const deal = await findDealById(dealId, user);

    if (!deal) {
      return null;
    }

    if (input.leadId) {
      await assertLeadExists(input.leadId);
    }

    if (input.sellerId) {
      await assertSellerExists(input.sellerId);
    }

    await deal.update({
      title: input.title?.trim() ?? deal.title,
      description: normalizeOptionalText(input.description) ?? deal.description,
      value: input.value?.toFixed(2) ?? deal.value,
      leadId: input.leadId ?? deal.leadId,
      sellerId: input.sellerId ?? deal.sellerId
    });

    const updatedDeal = await findDealById(dealId, user);
    return updatedDeal ? toDealDto(updatedDeal) : null;
  },

  findStatusById: async (dealId, user) => {
    const deal = await findDealById(dealId, user);
    return deal ? toDealDto(deal) : null;
  },

  changeStatus: async (dealId, input, user) => {
    const deal = await findDealById(dealId, user);
    return deal ? updateStatusInTransaction(deal, input.status, user.id, null) : null;
  },

  win: async (dealId, user) => {
    const deal = await findDealById(dealId, user);
    return deal ? updateStatusInTransaction(deal, "WON", user.id, null) : null;
  },

  lose: async (dealId, input, user) => {
    const deal = await findDealById(dealId, user);
    return deal ? updateStatusInTransaction(deal, "LOST", user.id, input.reason ?? null) : null;
  },

  reopen: async (dealId, user) => {
    const deal = await findDealById(dealId, user);
    return deal ? updateStatusInTransaction(deal, "IN_PROGRESS", user.id, null) : null;
  }
});
