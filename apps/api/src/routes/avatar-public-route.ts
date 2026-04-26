import type { APIResponse } from "@repo/types";
import { Hono } from "hono";

import { listAvatars } from "../services/avatar-service";

const avatarPublicRoute = new Hono().get("/", async (c) => {
  const items = await listAvatars(false); // enabled, non-deleted only
  return c.json<APIResponse<typeof items>>({ data: items });
});

export default avatarPublicRoute;
