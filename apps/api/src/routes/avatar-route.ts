import type { APIResponse } from "@repo/types";
import { Hono } from "hono";
import { z } from "zod";

import { adminMiddleware } from "../middleware/admin";
import { BadRequest } from "../lib/api-error";
import {
  listEventsForAvatar,
  softDeleteAvatarEvent,
  uploadAvatarEvent,
} from "../services/avatar-event-service";
import {
  listAvatars,
  softDeleteAvatar,
  uploadAvatar,
} from "../services/avatar-service";

const idParam = z.object({ id: z.string().uuid() });
const eventIdParam = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
});

function asNullableString(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

function parseTags(v: unknown): string[] {
  if (typeof v !== "string") return [];
  return v
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

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

    if (!(file instanceof File)) {
      throw BadRequest("`file` form field is required");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const avatar = await uploadAvatar({
      name: asNullableString(body["name"]),
      buffer,
      contentType: file.type,
    });
    return c.json<APIResponse<typeof avatar>>({ data: avatar });
  })
  .delete("/:id", async (c) => {
    const { id } = idParam.parse({ id: c.req.param("id") });
    await softDeleteAvatar(id);
    return c.json<APIResponse<{ id: string }>>({ data: { id } });
  })

  // Events nested under :id
  .get("/:id/events", async (c) => {
    const { id } = idParam.parse({ id: c.req.param("id") });
    const includeDisabled = c.req.query("includeDisabled") === "true";
    const items = await listEventsForAvatar(id, includeDisabled);
    return c.json<APIResponse<typeof items>>({ data: items });
  })
  .post("/:id/events", async (c) => {
    const { id } = idParam.parse({ id: c.req.param("id") });
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!(file instanceof File)) {
      throw BadRequest("`file` form field is required");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const event = await uploadAvatarEvent({
      avatarId: id,
      name: asNullableString(body["name"]),
      setting: asNullableString(body["setting"]),
      action: asNullableString(body["action"]),
      tags: parseTags(body["tags"]),
      buffer,
      contentType: file.type,
    });
    return c.json<APIResponse<typeof event>>({ data: event });
  })
  .delete("/:id/events/:eventId", async (c) => {
    const { id, eventId } = eventIdParam.parse({
      id: c.req.param("id"),
      eventId: c.req.param("eventId"),
    });
    await softDeleteAvatarEvent(id, eventId);
    return c.json<APIResponse<{ id: string }>>({ data: { id: eventId } });
  });

export default avatarRoute;
