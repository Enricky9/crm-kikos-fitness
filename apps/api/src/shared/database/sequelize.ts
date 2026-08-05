import { Sequelize } from "sequelize";

import { env } from "../config/env.js";

export const createSequelize = (databaseUrl = env.DATABASE_URL) =>
  new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: env.NODE_ENV === "development" ? console.log : false,
    define: {
      underscored: true,
      timestamps: true
    }
  });

export const sequelize = createSequelize();
