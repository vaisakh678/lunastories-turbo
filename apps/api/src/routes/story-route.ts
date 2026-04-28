import { zValidator } from "@hono/zod-validator";
import type { APIResponse } from "@repo/types";
import { createStorySchema, storyListQuerySchema } from "@repo/zod";
import { Hono } from "hono";
import { z } from "zod";

import { getUserIdFromCTX } from "../lib/helpers";
import {
  createStory,
  generateStoryAudio,
  getLatestActiveStory,
  getStoriesByUser,
  getStoryById,
  markStoryAsRead,
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
  .get("/", zValidator("query", storyListQuerySchema), async (c) => {
    const userId = getUserIdFromCTX(c);
    const query = c.req.valid("query");

    const stories = await getStoriesByUser(userId, query);
    return c.json<APIResponse<typeof stories>>({ data: stories });
  })
  .get("/latest-active", async (c) => {
    const userId = getUserIdFromCTX(c);
    const story = await getLatestActiveStory(userId);
    // Wrap in a non-null object so the iOS APIClient (which rejects
    // top-level null `data`) can decode the absence cleanly.
    return c.json<APIResponse<{ story: typeof story }>>({ data: { story } });
  })
  .get("/:id", zValidator("param", storyIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const userId = getUserIdFromCTX(c);

    const story = await getStoryById(userId, id);
    return c.json<APIResponse<typeof story>>({ data: story });
  })
  .post(
    "/:id/audio",
    zValidator("param", storyIdParamSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const userId = getUserIdFromCTX(c);

      const story = await generateStoryAudio(userId, id);
      return c.json<APIResponse<typeof story>>({ data: story });
    },
  )
  .post("/:id/read", zValidator("param", storyIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const userId = getUserIdFromCTX(c);

    const result = await markStoryAsRead(userId, id);
    return c.json<APIResponse<typeof result>>({ data: result });
  })
  .delete("/:id", zValidator("param", storyIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const userId = getUserIdFromCTX(c);

    await softDeleteStory(userId, id);
    return c.json<APIResponse<{ id: string }>>({ data: { id } });
  });

export default storyRoute;
