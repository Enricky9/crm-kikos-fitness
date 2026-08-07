import { Op, Sequelize } from "sequelize";

import type { LeadDto } from "@kikos/shared";

import { DealModel, LeadModel } from "../../../../../shared/database/models/index.js";
import type { LeadRepository } from "../../../application/ports/lead-repository.js";

const toLeadDto = (lead: LeadModel, dealsCount = 0): LeadDto => ({
  id: lead.id,
  name: lead.name,
  email: lead.email,
  phone: lead.phone,
  company: lead.company,
  source: lead.source,
  dealsCount,
  createdAt: lead.createdAt.toISOString(),
  updatedAt: lead.updatedAt.toISOString()
});

const normalizeOptionalText = (value: string | null | undefined) => {
  if (value === undefined) {
    return undefined;
  }

  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
};

export const createSequelizeLeadRepository = (): LeadRepository => ({
  list: async (query) => {
    const offset = (query.page - 1) * query.pageSize;
    const sortField = query.sortBy === "name" ? "name" : "created_at";
    const sortDirection = query.sortOrder.toUpperCase();
    const search = query.search?.trim();
    const where = search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { company: { [Op.iLike]: `%${search}%` } }
          ]
        }
      : undefined;

    const { rows, count } = await LeadModel.findAndCountAll({
      attributes: {
        include: [[Sequelize.fn("COUNT", Sequelize.col("deals.id")), "dealsCount"]]
      },
      include: [{ model: DealModel, as: "deals", attributes: [], required: false }],
      where,
      group: ["LeadModel.id"],
      order: [[sortField, sortDirection]],
      limit: query.pageSize,
      offset,
      subQuery: false
    });

    const total = Array.isArray(count) ? count.length : count;
    const data = rows.map((lead) => {
      const rawCount = lead.get("dealsCount");
      const dealsCount = typeof rawCount === "number" ? rawCount : Number(rawCount ?? 0);
      return toLeadDto(lead, dealsCount);
    });

    return {
      data,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize)
      }
    };
  },

  create: async (input) => {
    const lead = await LeadModel.create({
      name: input.name.trim(),
      email: normalizeOptionalText(input.email) ?? null,
      phone: input.phone.trim(),
      company: normalizeOptionalText(input.company) ?? null,
      source: normalizeOptionalText(input.source) ?? null
    });

    return toLeadDto(lead);
  },

  findById: async (leadId) => {
    const lead = await LeadModel.findByPk(leadId, {
      include: [{ model: DealModel, as: "deals", attributes: ["id"], required: false }]
    });

    if (!lead) {
      return null;
    }

    const deals = lead.get("deals");
    const dealsCount = Array.isArray(deals) ? deals.length : 0;
    return toLeadDto(lead, dealsCount);
  },

  update: async (leadId, input) => {
    const lead = await LeadModel.findByPk(leadId);

    if (!lead) {
      return null;
    }

    await lead.update({
      name: input.name?.trim() ?? lead.name,
      email: normalizeOptionalText(input.email) ?? lead.email,
      phone: input.phone?.trim() ?? lead.phone,
      company: normalizeOptionalText(input.company) ?? lead.company,
      source: normalizeOptionalText(input.source) ?? lead.source
    });

    return toLeadDto(lead);
  }
});
