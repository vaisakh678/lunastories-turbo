import { createClerkClient } from "@clerk/backend";
import db, { userSchema } from "@repo/db";
import { and, eq, isNull } from "drizzle-orm";

import { env } from "../config/env";
import { NotFound } from "../lib/api-error";
import { logger } from "../lib/logger";

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

export async function deleteOwnAccount(userId: string): Promise<void> {
  const [user] = await db
    .select({ clerkId: userSchema.clerkId })
    .from(userSchema)
    .where(and(eq(userSchema.id, userId), isNull(userSchema.deletedAt)))
    .limit(1);

  if (!user) throw NotFound("User not found");

  try {
    await clerk.users.deleteUser(user.clerkId);
  } catch (err) {
    // Don't block local soft-delete on Clerk failures (user may already be
    // gone there, or Clerk could be temporarily down). The next sign-in
    // attempt will simply fail to verify their token, which is the desired
    // end state anyway.
    logger.warn({ err, clerkId: user.clerkId }, "Failed to delete Clerk user");
  }

  await db
    .update(userSchema)
    .set({
      email: `delete_${userId.slice(0, 5)}@gmail.com`,
      deletedAt: new Date(),
    })
    .where(eq(userSchema.id, userId));
}
