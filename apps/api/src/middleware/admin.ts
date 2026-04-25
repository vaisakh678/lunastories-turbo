import db, { userSchema } from "@repo/db";
import { eq } from "drizzle-orm";
import type { Context, Next } from "hono";

import { Forbidden } from "../lib/api-error";
import { getUserIdFromCTX } from "../lib/helpers";

export async function adminMiddleware(c: Context, next: Next) {
  const userId = getUserIdFromCTX(c);

  const [user] = await db
    .select({ role: userSchema.role })
    .from(userSchema)
    .where(eq(userSchema.id, userId))
    .limit(1);

  if (!user || user.role !== "admin") {
    throw Forbidden("Admin access required");
  }

  await next();
}
