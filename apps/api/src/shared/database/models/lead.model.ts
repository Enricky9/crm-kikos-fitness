import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes, type Sequelize } from "sequelize";

export class LeadModel extends Model<InferAttributes<LeadModel>, InferCreationAttributes<LeadModel>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string | null;
  declare phone: string;
  declare company: string | null;
  declare source: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export const initLeadModel = (sequelize: Sequelize) => {
  LeadModel.init(
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
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      company: {
        type: DataTypes.STRING(160),
        allowNull: true
      },
      source: {
        type: DataTypes.STRING(80),
        allowNull: true
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
      tableName: "leads"
    }
  );
};
