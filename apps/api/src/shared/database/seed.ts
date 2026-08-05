import bcrypt from "bcryptjs";
import type { Transaction } from "sequelize";

import type { DealStatus, UserRole } from "@kikos/shared";

import { CommentModel, DealModel, DealStatusHistoryModel, LeadModel, UserModel } from "./models/index.js";
import { sequelize } from "./sequelize.js";

type SeedUser = {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: UserRole;
};

type SeedLead = {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly company: string;
  readonly source: string;
};

type SeedDeal = {
  readonly title: string;
  readonly description: string;
  readonly value: string;
  readonly status: DealStatus;
  readonly leadEmail: string;
  readonly sellerEmail: string;
  readonly lostReason?: string;
};

const users: readonly SeedUser[] = [
  { name: "Administrador Kikos", email: "admin@kikos.local", password: "Admin123!", role: "ADMIN" },
  { name: "Vendedor Kikos", email: "seller@kikos.local", password: "Seller123!", role: "SELLER" },
  { name: "Marina Souza", email: "marina@kikos.local", password: "Seller123!", role: "SELLER" }
];

const leads: readonly SeedLead[] = [
  {
    name: "Carlos Almeida",
    email: "carlos.almeida@example.com",
    phone: "+55 11 98888-0001",
    company: "Academia Forma Total",
    source: "Site"
  },
  {
    name: "Beatriz Lima",
    email: "beatriz.lima@example.com",
    phone: "+55 21 97777-0002",
    company: "Condominio Jardim Sul",
    source: "Indicacao"
  },
  {
    name: "Rafael Mendes",
    email: "rafael.mendes@example.com",
    phone: "+55 31 96666-0003",
    company: "Studio RM",
    source: "Evento"
  },
  {
    name: "Juliana Rocha",
    email: "juliana.rocha@example.com",
    phone: "+55 41 95555-0004",
    company: "Hotel Atlantico",
    source: "Instagram"
  },
  {
    name: "Patricia Gomes",
    email: "patricia.gomes@example.com",
    phone: "+55 51 94444-0005",
    company: "Clube Movimento",
    source: "Outbound"
  }
];

const deals: readonly SeedDeal[] = [
  {
    title: "Esteiras profissionais para academia",
    description: "Renovacao de cardio com instalacao em duas salas.",
    value: "48500.00",
    status: "NEW",
    leadEmail: "carlos.almeida@example.com",
    sellerEmail: "seller@kikos.local"
  },
  {
    title: "Equipamentos para sala fitness",
    description: "Projeto para area compartilhada de condominio.",
    value: "32000.00",
    status: "IN_PROGRESS",
    leadEmail: "beatriz.lima@example.com",
    sellerEmail: "seller@kikos.local"
  },
  {
    title: "Kit funcional completo",
    description: "Compra de acessorios, racks e pesos livres.",
    value: "17800.00",
    status: "PROPOSAL",
    leadEmail: "rafael.mendes@example.com",
    sellerEmail: "marina@kikos.local"
  },
  {
    title: "Bicicletas ergometricas premium",
    description: "Pedido aprovado para academia do hotel.",
    value: "26200.00",
    status: "WON",
    leadEmail: "juliana.rocha@example.com",
    sellerEmail: "marina@kikos.local"
  },
  {
    title: "Modernizacao de musculacao",
    description: "Cliente optou por aguardar novo orcamento anual.",
    value: "54000.00",
    status: "LOST",
    leadEmail: "patricia.gomes@example.com",
    sellerEmail: "seller@kikos.local",
    lostReason: "Orcamento adiado pelo cliente"
  }
];

const upsertUser = async (user: SeedUser, transaction: Transaction) => {
  const existingUser = await UserModel.findOne({ where: { email: user.email }, transaction });
  const passwordHash = await bcrypt.hash(user.password, 12);

  if (existingUser) {
    await existingUser.update({ name: user.name, passwordHash, role: user.role }, { transaction });
    return existingUser;
  }

  return UserModel.create(
    {
      name: user.name,
      email: user.email,
      passwordHash,
      role: user.role
    },
    { transaction }
  );
};

const upsertLead = async (lead: SeedLead, transaction: Transaction) => {
  const existingLead = await LeadModel.findOne({ where: { email: lead.email }, transaction });

  if (existingLead) {
    await existingLead.update(lead, { transaction });
    return existingLead;
  }

  return LeadModel.create(lead, { transaction });
};

const seed = async () => {
  await sequelize.authenticate();

  await sequelize.transaction(async (transaction) => {
    const seededUsers = await Promise.all(users.map((user) => upsertUser(user, transaction)));
    const seededLeads = await Promise.all(leads.map((lead) => upsertLead(lead, transaction)));

    const usersByEmail = new Map(seededUsers.map((user) => [user.email, user]));
    const leadsByEmail = new Map(seededLeads.map((lead) => [lead.email, lead]));

    for (const deal of deals) {
      const lead = leadsByEmail.get(deal.leadEmail);
      const seller = usersByEmail.get(deal.sellerEmail);

      if (!lead || !seller) {
        throw new Error(`Missing seed relation for deal "${deal.title}"`);
      }

      const closedAt = deal.status === "WON" || deal.status === "LOST" ? new Date() : null;
      const existingDeal = await DealModel.findOne({
        where: { title: deal.title },
        transaction
      });

      const persistedDeal =
        existingDeal ??
        (await DealModel.create(
          {
            title: deal.title,
            description: deal.description,
            value: deal.value,
            status: deal.status,
            leadId: lead.id,
            sellerId: seller.id,
            lostReason: deal.lostReason ?? null,
            closedAt
          },
          { transaction }
        ));

      await persistedDeal.update(
        {
          description: deal.description,
          value: deal.value,
          status: deal.status,
          leadId: lead.id,
          sellerId: seller.id,
          lostReason: deal.lostReason ?? null,
          closedAt: persistedDeal.closedAt ?? closedAt
        },
        { transaction }
      );

      await DealStatusHistoryModel.findOrCreate({
        where: { dealId: persistedDeal.id, fromStatus: null, toStatus: deal.status },
        defaults: {
          dealId: persistedDeal.id,
          fromStatus: null,
          toStatus: deal.status,
          changedBy: seller.id
        },
        transaction
      });
    }

    const admin = usersByEmail.get("admin@kikos.local");
    const firstLead = leadsByEmail.get("carlos.almeida@example.com");
    const firstDeal = await DealModel.findOne({
      where: { title: "Esteiras profissionais para academia" },
      transaction
    });

    if (!admin || !firstLead || !firstDeal) {
      throw new Error("Missing seed entities for comments");
    }

    await CommentModel.findOrCreate({
      where: { content: "Lead demonstrou interesse em equipamentos de cardio.", leadId: firstLead.id },
      defaults: {
        content: "Lead demonstrou interesse em equipamentos de cardio.",
        authorId: admin.id,
        leadId: firstLead.id,
        dealId: null
      },
      transaction
    });

    await CommentModel.findOrCreate({
      where: { content: "Enviar proposta com prazo de instalacao e treinamento.", dealId: firstDeal.id },
      defaults: {
        content: "Enviar proposta com prazo de instalacao e treinamento.",
        authorId: admin.id,
        leadId: null,
        dealId: firstDeal.id
      },
      transaction
    });
  });
};

try {
  await seed();
  console.log("Database seed completed");
} finally {
  await sequelize.close();
}
