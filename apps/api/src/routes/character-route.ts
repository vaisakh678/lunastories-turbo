import { zValidator } from "@hono/zod-validator";
import type { APIResponse } from "@repo/types";
import { createCharacterSchema } from "@repo/zod";
import { Hono } from "hono";

import { getUserIdFromCTX } from "../lib/helpers";
import {
  createCharacter,
  getCharactersByUser,
} from "../services/character-service";

const characterRoute = new Hono()
  .post("/", zValidator("json", createCharacterSchema), async (c) => {
    const data = c.req.valid("json");
    const userId = getUserIdFromCTX(c);

    const character = await createCharacter(userId, data);
    return c.json<APIResponse<typeof character>>({ data: character });
  })
  .get("/", async (c) => {
    const userId = getUserIdFromCTX(c);

    const characters = await getCharactersByUser(userId);
    return c.json<APIResponse<typeof characters>>({ data: characters });
  });

export default characterRoute;
