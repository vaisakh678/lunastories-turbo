import type { Context, Next } from "hono";

import { logger } from "../lib/logger";
import {
  findOrCreateUserByClerkId,
  verifyClerkSession,
} from "../services/auth-service";

export async function authMiddleware(c: Context, next: Next) {
  logger.debug({ path: c.req.path }, "authMiddleware called");

  const header = c.req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    logger.debug("No Bearer token found in authorization header");
    return c.json({ data: null, error: "Unauthorized" }, 401);
  }

  const token = header.slice(7).trim();
  if (!token) {
    logger.debug("No token found after Bearer in authorization header");
    return c.json({ data: null, error: "Unauthorized" }, 401);
  }

  const clerkId = await verifyClerkSession(token);
  logger.debug({ clerkId }, "Clerk session verified");

  const userId = await findOrCreateUserByClerkId(clerkId);
  logger.debug({ userId }, "User found or created");

  c.set("userId", userId);
  await next();
}
