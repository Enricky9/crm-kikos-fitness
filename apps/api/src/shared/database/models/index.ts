import type { Sequelize } from "sequelize";

import { CommentModel, initCommentModel } from "./comment.model.js";
import { DealStatusHistoryModel, initDealStatusHistoryModel } from "./deal-status-history.model.js";
import { DealModel, initDealModel } from "./deal.model.js";
import { LeadModel, initLeadModel } from "./lead.model.js";
import { UserModel, initUserModel } from "./user.model.js";

export const initModels = (sequelize: Sequelize) => {
  initUserModel(sequelize);
  initLeadModel(sequelize);
  initDealModel(sequelize);
  initCommentModel(sequelize);
  initDealStatusHistoryModel(sequelize);

  LeadModel.hasMany(DealModel, { foreignKey: "leadId", as: "deals" });
  DealModel.belongsTo(LeadModel, { foreignKey: "leadId", as: "lead" });

  UserModel.hasMany(DealModel, { foreignKey: "sellerId", as: "assignedDeals" });
  DealModel.belongsTo(UserModel, { foreignKey: "sellerId", as: "seller" });

  UserModel.hasMany(CommentModel, { foreignKey: "authorId", as: "comments" });
  CommentModel.belongsTo(UserModel, { foreignKey: "authorId", as: "author" });

  LeadModel.hasMany(CommentModel, { foreignKey: "leadId", as: "comments" });
  CommentModel.belongsTo(LeadModel, { foreignKey: "leadId", as: "lead" });

  DealModel.hasMany(CommentModel, { foreignKey: "dealId", as: "comments" });
  CommentModel.belongsTo(DealModel, { foreignKey: "dealId", as: "deal" });

  DealModel.hasMany(DealStatusHistoryModel, { foreignKey: "dealId", as: "statusHistory" });
  DealStatusHistoryModel.belongsTo(DealModel, { foreignKey: "dealId", as: "deal" });

  UserModel.hasMany(DealStatusHistoryModel, { foreignKey: "changedBy", as: "statusChanges" });
  DealStatusHistoryModel.belongsTo(UserModel, { foreignKey: "changedBy", as: "changedByUser" });
};

export { CommentModel, DealModel, DealStatusHistoryModel, LeadModel, UserModel };
