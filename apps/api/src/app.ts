import type { APIResponse } from "@repo/types";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { APIError } from "./lib/api-error";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middleware/auth";
import appRoutes from "./routes";

export function createApp() {
  const app = new Hono();
  app.use(honoLogger());
  app.use("*", cors());

  app.onError((err, c) => {
    if (err instanceof APIError) {
      return c.json<APIResponse<null>>(
        { data: null, error: err.message },
        err.statusCode as ContentfulStatusCode,
      );
    }
    logger.error({ err, method: c.req.method, path: c.req.path }, "Unhandled error");
    return c.json<APIResponse<null>>(
      { data: null, error: "Internal server error" },
      500,
    );
  });

  app.use("/api/v1/*", async (c, next) => {
    const path = c.req.path;
    if (path.startsWith("/api/v1/health")) return next();
    return authMiddleware(c, next);
  });

  app.get("/", (c) =>
    c.json<APIResponse<{ name: string }>>({ data: { name: "Milo Tales API" } }),
  );

  app.route("/api/v1", appRoutes);

  return app;
}
