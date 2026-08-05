import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes, type Sequelize } from "sequelize";

import type { DealStatus } from "@kikos/shared";

export class DealModel extends Model<InferAttributes<DealModel>, InferCreationAttributes<DealModel>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare description: string | null;
  declare value: string;
  declare status: DealStatus;
  declare leadId: string;
  declare sellerId: string;
  declare lostReason: CreationOptional<string | null>;
  declare closedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export const initDealModel = (sequelize: Sequelize) => {
  DealModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING(180),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      value: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM("NEW", "IN_PROGRESS", "PROPOSAL", "WON", "LOST"),
        allowNull: false
      },
      leadId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "lead_id"
      },
      sellerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "seller_id"
      },
      lostReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "lost_reason"
      },
      closedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "closed_at"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at"
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "updated_at"
      }
    },
    {
      sequelize,
      tableName: "deals"
    }
  );
};
