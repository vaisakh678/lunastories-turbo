import { zValidator } from "@hono/zod-validator";
import type { APIResponse } from "@repo/types";
import { createStorySchema } from "@repo/zod";
import { Hono } from "hono";
import { z } from "zod";

import { getUserIdFromCTX } from "../lib/helpers";
import {
  createStory,
  getStoriesByUser,
  getStoryById,
  softDeleteStory,
} from "../services/story-service";

const storyIdParamSchema = z.object({ id: z.string().uuid() });

const storyRoute = new Hono()
  .post("/", zValidator("json", createStorySchema), async (c) => {
    const data = c.req.valid("json");
    const userId = getUserIdFromCTX(c);

    const story = await createStory(userId, data);
    return c.json<APIResponse<typeof story>>({ data: story });
  })
  .get("/", async (c) => {
    const userId = getUserIdFromCTX(c);

    const stories = await getStoriesByUser(userId);
    return c.json<APIResponse<typeof stories>>({ data: stories });
  })
  .get("/:id", zValidator("param", storyIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const userId = getUserIdFromCTX(c);

    const story = await getStoryById(userId, id);
    return c.json<APIResponse<typeof story>>({ data: story });
  })
  .delete("/:id", zValidator("param", storyIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const userId = getUserIdFromCTX(c);

    await softDeleteStory(userId, id);
    return c.json<APIResponse<{ id: string }>>({ data: { id } });
  });

export default storyRoute;
