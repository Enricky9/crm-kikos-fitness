import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes, type Sequelize } from "sequelize";

export class CommentModel extends Model<InferAttributes<CommentModel>, InferCreationAttributes<CommentModel>> {
  declare id: CreationOptional<string>;
  declare content: string;
  declare authorId: string;
  declare leadId: CreationOptional<string | null>;
  declare dealId: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
}

export const initCommentModel = (sequelize: Sequelize) => {
  CommentModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      authorId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "author_id"
      },
      leadId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "lead_id"
      },
      dealId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "deal_id"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at"
      }
    },
    {
      sequelize,
      tableName: "comments",
      updatedAt: false
    }
  );
};
