import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes, type Sequelize } from "sequelize";

import type { DealStatus } from "@kikos/shared";

export class DealStatusHistoryModel extends Model<
  InferAttributes<DealStatusHistoryModel>,
  InferCreationAttributes<DealStatusHistoryModel>
> {
  declare id: CreationOptional<string>;
  declare dealId: string;
  declare fromStatus: CreationOptional<DealStatus | null>;
  declare toStatus: DealStatus;
  declare changedBy: string;
  declare createdAt: CreationOptional<Date>;
}

export const initDealStatusHistoryModel = (sequelize: Sequelize) => {
  DealStatusHistoryModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      dealId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "deal_id"
      },
      fromStatus: {
        type: DataTypes.ENUM("NEW", "IN_PROGRESS", "PROPOSAL", "WON", "LOST"),
        allowNull: true,
        field: "from_status"
      },
      toStatus: {
        type: DataTypes.ENUM("NEW", "IN_PROGRESS", "PROPOSAL", "WON", "LOST"),
        allowNull: false,
        field: "to_status"
      },
      changedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "changed_by"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at"
      }
    },
    {
      sequelize,
      tableName: "deal_status_history",
      updatedAt: false
    }
  );
};
