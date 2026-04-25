import { createClerkClient, verifyToken } from "@clerk/backend";
import db, { userSchema } from "@repo/db";
import { eq } from "drizzle-orm";

import { env } from "../config/env";
import { Unauthorized } from "../lib/api-error";
import { logger } from "../lib/logger";

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

export async function verifyClerkSession(token: string): Promise<string> {
  try {
    const options = env.CLERK_JWT_KEY
      ? { jwtKey: env.CLERK_JWT_KEY }
      : { secretKey: env.CLERK_SECRET_KEY };
    const verified = await verifyToken(token, options);
    if (!verified.sub) throw Unauthorized("Invalid token");
    return verified.sub;
  } catch (err) {
    if (err instanceof Error && err.name === "APIError") throw err;
    logger.error({ err }, "verifyClerkSession verify failed");
    throw Unauthorized("Invalid token");
  }
}

export async function findOrCreateUserByClerkId(
  clerkId: string,
): Promise<string> {
  const [existing] = await db
    .select({ id: userSchema.id })
    .from(userSchema)
    .where(eq(userSchema.clerkId, clerkId))
    .limit(1);

  if (existing) return existing.id;

  const clerkUser = await clerk.users.getUser(clerkId);

  const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;
  if (!primaryEmail) {
    throw Unauthorized("Clerk user has no primary email");
  }

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    null;

  const [created] = await db
    .insert(userSchema)
    .values({
      clerkId,
      email: primaryEmail,
      name: fullName,
      emailVerified:
        clerkUser.primaryEmailAddress?.verification?.status === "verified",
    })
    .returning({ id: userSchema.id });

  return created.id;
}
