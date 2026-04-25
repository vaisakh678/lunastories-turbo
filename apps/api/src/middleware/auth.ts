import type { Context, Next } from "hono";

import {
  findOrCreateUserByClerkId,
  verifyClerkSession,
} from "../services/auth-service";

export async function authMiddleware(c: Context, next: Next) {
  const header = c.req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ data: null, error: "Unauthorized" }, 401);
  }
  const token = header.slice(7).trim();
  if (!token) {
    return c.json({ data: null, error: "Unauthorized" }, 401);
  }

  const clerkId = await verifyClerkSession(token);
  const userId = await findOrCreateUserByClerkId(clerkId);
  c.set("userId", userId);
  await next();
}
