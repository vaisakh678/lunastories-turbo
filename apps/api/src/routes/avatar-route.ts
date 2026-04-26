import type { APIResponse } from "@repo/types";
import { Hono } from "hono";
import { z } from "zod";

import { adminMiddleware } from "../middleware/admin";
import { BadRequest } from "../lib/api-error";
import {
  listAvatars,
  softDeleteAvatar,
  uploadAvatar,
} from "../services/avatar-service";

const idParam = z.object({ id: z.string().uuid() });

const avatarRoute = new Hono()
  .use("*", adminMiddleware)
  .get("/", async (c) => {
    const includeDisabled = c.req.query("includeDisabled") === "true";
    const items = await listAvatars(includeDisabled);
    return c.json<APIResponse<typeof items>>({ data: items });
  })
  .post("/", async (c) => {
    const body = await c.req.parseBody();
    const file = body["file"];
    const name = typeof body["name"] === "string" ? body["name"].trim() || null : null;

    if (!(file instanceof File)) {
      throw BadRequest("`file` form field is required");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const avatar = await uploadAvatar({
      name,
      buffer,
      contentType: file.type,
    });
    return c.json<APIResponse<typeof avatar>>({ data: avatar });
  })
  .delete("/:id", async (c) => {
    const { id } = idParam.parse({ id: c.req.param("id") });
    await softDeleteAvatar(id);
    return c.json<APIResponse<{ id: string }>>({ data: { id } });
  });

export default avatarRoute;
