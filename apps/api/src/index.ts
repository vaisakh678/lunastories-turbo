import { serve } from "@hono/node-server";
import "./config/env";
import { createApp } from "./app";
import { logger } from "./lib/logger";

const app = createApp();

const server = serve({ fetch: app.fetch, port: 3001 }, (info) => {
  logger.info({ port: info.port }, `Server running at http://localhost:${info.port}`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
