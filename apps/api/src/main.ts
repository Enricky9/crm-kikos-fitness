import { buildServer } from "./app/server.js";

const port = Number(process.env.PORT ?? 3333);
const host = "0.0.0.0";

const server = await buildServer();

try {
  await server.listen({ host, port });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
