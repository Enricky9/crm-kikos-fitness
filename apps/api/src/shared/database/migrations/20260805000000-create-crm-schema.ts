import { DataTypes, type QueryInterface, Sequelize } from "sequelize";

const statusValues = ["NEW", "IN_PROGRESS", "PROPOSAL", "WON", "LOST"] as const;
const roleValues = ["ADMIN", "SELLER"] as const;

export const up = async ({ context }: { context: QueryInterface }) => {
  await context.sequelize.transaction(async (transaction) => {
    await context.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', { transaction });

    await context.createTable(
      "users",
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: Sequelize.literal("gen_random_uuid()")
        },
        name: { type: DataTypes.STRING(160), allowNull: false },
        email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
        password_hash: { type: DataTypes.STRING(255), allowNull: false },
        role: { type: DataTypes.ENUM(...roleValues), allowNull: false },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
        }
      },
      { transaction }
    );

    await context.createTable(
      "leads",
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: Sequelize.literal("gen_random_uuid()")
        },
        name: { type: DataTypes.STRING(160), allowNull: false },
        email: { type: DataTypes.STRING(255), allowNull: true },
        phone: { type: DataTypes.STRING(32), allowNull: false },
        company: { type: DataTypes.STRING(160), allowNull: true },
        source: { type: DataTypes.STRING(80), allowNull: true },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
        }
      },
      { transaction }
    );

    await context.createTable(
      "deals",
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: Sequelize.literal("gen_random_uuid()")
        },
        title: { type: DataTypes.STRING(180), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        value: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        status: { type: DataTypes.ENUM(...statusValues), allowNull: false, defaultValue: "NEW" },
        lead_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "leads", key: "id" },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE"
        },
        seller_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE"
        },
        lost_reason: { type: DataTypes.TEXT, allowNull: true },
        closed_at: { type: DataTypes.DATE, allowNull: true },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
        }
      },
      { transaction }
    );

    await context.createTable(
      "comments",
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: Sequelize.literal("gen_random_uuid()")
        },
        content: { type: DataTypes.TEXT, allowNull: false },
        author_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE"
        },
        lead_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: "leads", key: "id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE"
        },
        deal_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: "deals", key: "id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE"
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
        }
      },
      { transaction }
    );

    await context.createTable(
      "deal_status_history",
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: Sequelize.literal("gen_random_uuid()")
        },
        deal_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "deals", key: "id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE"
        },
        from_status: { type: DataTypes.ENUM(...statusValues), allowNull: true },
        to_status: { type: DataTypes.ENUM(...statusValues), allowNull: false },
        changed_by: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE"
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
        }
      },
      { transaction }
    );

    await context.sequelize.query(
      "ALTER TABLE deals ADD CONSTRAINT deals_value_non_negative CHECK (value >= 0);",
      { transaction }
    );
    await context.sequelize.query(
      "ALTER TABLE comments ADD CONSTRAINT comments_target_required " +
        "CHECK (lead_id IS NOT NULL OR deal_id IS NOT NULL);",
      { transaction }
    );

    await context.addIndex("leads", ["name"], { transaction });
    await context.addIndex("leads", ["email"], { transaction });
    await context.addIndex("leads", ["company"], { transaction });
    await context.addIndex("deals", ["status"], { transaction });
    await context.addIndex("deals", ["seller_id"], { transaction });
    await context.addIndex("deals", ["lead_id"], { transaction });
  });
};

export const down = async ({ context }: { context: QueryInterface }) => {
  await context.sequelize.transaction(async (transaction) => {
    await context.dropTable("deal_status_history", { transaction });
    await context.dropTable("comments", { transaction });
    await context.dropTable("deals", { transaction });
    await context.dropTable("leads", { transaction });
    await context.dropTable("users", { transaction });
    await context.sequelize.query("DROP TYPE IF EXISTS enum_deal_status_history_from_status;", {
      transaction
    });
    await context.sequelize.query("DROP TYPE IF EXISTS enum_deal_status_history_to_status;", {
      transaction
    });
    await context.sequelize.query("DROP TYPE IF EXISTS enum_deals_status;", { transaction });
    await context.sequelize.query("DROP TYPE IF EXISTS enum_users_role;", { transaction });
  });
};
