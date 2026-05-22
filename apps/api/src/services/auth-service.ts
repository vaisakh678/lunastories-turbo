import { createClerkClient, verifyToken } from "@clerk/backend";
import db, { userSchema } from "@repo/db";
import { eq } from "drizzle-orm";

import { env } from "../config/env";
import { Unauthorized } from "../lib/api-error";
import { deletedEmail } from "../lib/helpers";
import { logger } from "../lib/logger";

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

export async function verifyClerkSession(token: string): Promise<string> {
  try {
    const verified = await verifyToken(token, {
      jwtKey: env.CLERK_JWT_KEY,
      secretKey: env.CLERK_SECRET_KEY,
    });
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
    .select({ id: userSchema.id, deletedAt: userSchema.deletedAt })
    .from(userSchema)
    .where(eq(userSchema.clerkId, clerkId))
    .limit(1);

  // Live row — return it.
  if (existing && !existing.deletedAt) return existing.id;

  // Soft-deleted row for this Clerk account — restore it. Refresh
  // email/name from Clerk in case anything changed during the gap.
  // Without this, the user would be stuck: the auth middleware would
  // keep returning a row that getOwnProfile filters out via
  // `deletedAt IS NULL`, surfacing as "User not found" downstream.
  const clerkUser = await clerk.users.getUser(clerkId);
  const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;
  if (!primaryEmail) {
    throw Unauthorized("Clerk user has no primary email");
  }
  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    null;

  if (existing) {
    await db
      .update(userSchema)
      .set({
        email: primaryEmail,
        name: fullName,
        deletedAt: null,
        emailVerified:
          clerkUser.primaryEmailAddress?.verification?.status === "verified",
      })
      .where(eq(userSchema.id, existing.id));
    return existing.id;
  }

  // Brand new Clerk account — create a fresh row, soft-deleting any
  // unrelated row that happens to be holding the same email (e.g. from
  // a separate Clerk account that was previously deleted).
  const [staleByEmail] = await db
    .select({ id: userSchema.id })
    .from(userSchema)
    .where(eq(userSchema.email, primaryEmail))
    .limit(1);

  if (staleByEmail) {
    await db
      .update(userSchema)
      .set({
        email: deletedEmail(staleByEmail.id),
        deletedAt: new Date(),
      })
      .where(eq(userSchema.id, staleByEmail.id));
  }

  // ON CONFLICT clerk_id DO NOTHING guards the TOCTOU window: the iOS app
  // fires several authed requests in parallel right after sign-in and both
  // can reach this branch before either INSERT lands. When the second
  // INSERT no-ops, `created` is undefined and we re-select the winner.
  const [created] = await db
    .insert(userSchema)
    .values({
      clerkId,
      email: primaryEmail,
      name: fullName,
      emailVerified:
        clerkUser.primaryEmailAddress?.verification?.status === "verified",
    })
    .onConflictDoNothing({ target: userSchema.clerkId })
    .returning({ id: userSchema.id });

  if (created) return created.id;

  const [winner] = await db
    .select({ id: userSchema.id })
    .from(userSchema)
    .where(eq(userSchema.clerkId, clerkId))
    .limit(1);
  if (!winner) throw Unauthorized("Failed to create user");
  return winner.id;
}
