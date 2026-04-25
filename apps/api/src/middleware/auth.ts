import type { Context, Next } from "hono";

// Placeholder auth. Replace with real JWT/Clerk verification.
// For now the bearer token IS the user id (uuid) — convenient for local dev.
export async function authMiddleware(c: Context, next: Next) {
  const header = c.req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ data: null, error: "Unauthorized" }, 401);
  }
  const userId = header.slice(7).trim();
  if (!userId) {
    return c.json({ data: null, error: "Unauthorized" }, 401);
  }
  c.set("userId", userId);
  await next();
}
