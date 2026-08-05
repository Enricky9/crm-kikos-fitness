import { Sequelize } from "sequelize";

import { env } from "../config/env.js";
import { initModels } from "./models/index.js";

export const createSequelize = (databaseUrl = env.DATABASE_URL) => {
  const connection = new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: env.NODE_ENV === "development" ? console.log : false,
    define: {
      underscored: true,
      timestamps: true
    }
  });

  initModels(connection);

  return connection;
};

export const sequelize = createSequelize();
