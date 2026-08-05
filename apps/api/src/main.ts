import { buildServer } from "./app/server.js";
import { env } from "./shared/config/env.js";

const port = env.PORT;
const host = "0.0.0.0";

const server = await buildServer();

try {
  await server.listen({ host, port });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
