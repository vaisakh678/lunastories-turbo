import { zValidator } from "@hono/zod-validator";
import type { APIResponse } from "@repo/types";
import { adminListQuerySchema, adminStoryListQuerySchema } from "@repo/zod";
import { Hono } from "hono";
import { z } from "zod";

import { adminMiddleware } from "../middleware/admin";
import {
  getStatsAdmin,
  getStoryAdmin,
  getUserAdmin,
  listCharactersAdmin,
  listFeedbackAdmin,
  listStoriesAdmin,
  listUsersAdmin,
} from "../services/admin-service";

const idParamSchema = z.object({ id: z.string().uuid() });

const adminRoute = new Hono()
  .use("*", adminMiddleware)
  .get("/stats", async (c) => {
    const stats = await getStatsAdmin();
    return c.json<APIResponse<typeof stats>>({ data: stats });
  })
  .get(
    "/users",
    zValidator("query", adminListQuerySchema),
    async (c) => {
      const result = await listUsersAdmin(c.req.valid("query"));
      return c.json<APIResponse<typeof result>>({ data: result });
    },
  )
  .get(
    "/users/:id",
    zValidator("param", idParamSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const user = await getUserAdmin(id);
      return c.json<APIResponse<typeof user>>({ data: user });
    },
  )
  .get(
    "/stories",
    zValidator("query", adminStoryListQuerySchema),
    async (c) => {
      const result = await listStoriesAdmin(c.req.valid("query"));
      return c.json<APIResponse<typeof result>>({ data: result });
    },
  )
  .get(
    "/stories/:id",
    zValidator("param", idParamSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const story = await getStoryAdmin(id);
      return c.json<APIResponse<typeof story>>({ data: story });
    },
  )
  .get(
    "/characters",
    zValidator("query", adminListQuerySchema),
    async (c) => {
      const result = await listCharactersAdmin(c.req.valid("query"));
      return c.json<APIResponse<typeof result>>({ data: result });
    },
  )
  .get(
    "/feedback",
    zValidator("query", adminListQuerySchema),
    async (c) => {
      const result = await listFeedbackAdmin(c.req.valid("query"));
      return c.json<APIResponse<typeof result>>({ data: result });
    },
  );

export default adminRoute;
