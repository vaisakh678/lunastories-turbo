import type { APIResponse } from "@repo/types";
import { Hono } from "hono";

import { getUserIdFromCTX } from "../lib/helpers";
import {
  deleteOwnAccount,
  getOwnProfile,
  type UserProfile,
} from "../services/user-service";

const userRoute = new Hono()
  .get("/me", async (c) => {
    const userId = getUserIdFromCTX(c);
    const profile = await getOwnProfile(userId);
    return c.json<APIResponse<UserProfile>>({ data: profile });
  })
  .delete("/me", async (c) => {
    const userId = getUserIdFromCTX(c);
    await deleteOwnAccount(userId);
    return c.json<APIResponse<{ deleted: boolean }>>({ data: { deleted: true } });
  });

export default userRoute;
