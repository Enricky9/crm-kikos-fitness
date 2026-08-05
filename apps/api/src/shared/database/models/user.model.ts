import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes, type Sequelize } from "sequelize";

import type { UserRole } from "@kikos/shared";

export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare role: UserRole;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export const initUserModel = (sequelize: Sequelize) => {
  UserModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(160),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "password_hash"
      },
      role: {
        type: DataTypes.ENUM("ADMIN", "SELLER"),
        allowNull: false
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
      tableName: "users"
    }
  );
};
