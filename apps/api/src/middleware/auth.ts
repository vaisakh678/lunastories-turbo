import type { Context, Next } from "hono";

// Placeholder. Wire up to Clerk (or your auth of choice) later.
export async function authMiddleware(c: Context, next: Next) {
  const header = c.req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ data: null, error: "Unauthorized" }, 401);
  }
  // TODO: verify token, set c.set("userId", ...)
  await next();
}
