import { SequelizeStorage, Umzug } from "umzug";

import { sequelize } from "./sequelize.js";

const migrator = new Umzug({
  migrations: {
    glob: "src/shared/database/migrations/*.ts"
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console
});

const direction = process.argv[2] ?? "up";

if (direction !== "up" && direction !== "down") {
  console.error("Usage: pnpm db:migrate | pnpm --filter @kikos/api db:migrate:down");
  process.exit(1);
}

try {
  if (direction === "up") {
    await migrator.up();
  } else {
    await migrator.down();
  }
} finally {
  await sequelize.close();
}
