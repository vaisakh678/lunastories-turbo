import type { APIResponse } from "@repo/types";
import { Hono } from "hono";

import { getUserIdFromCTX } from "../lib/helpers";
import { deleteOwnAccount } from "../services/user-service";

const userRoute = new Hono().delete("/me", async (c) => {
  const userId = getUserIdFromCTX(c);
  await deleteOwnAccount(userId);
  return c.json<APIResponse<{ deleted: boolean }>>({ data: { deleted: true } });
});

export default userRoute;
