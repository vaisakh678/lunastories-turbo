import type { Context } from "hono";

export function getUserIdFromCTX(c: Context): string {
  return c.get("userId") as string;
}

export function deletedEmail(userId: string): string {
  return `deleted_${userId.slice(0, 8)}@deleted.invalid`;
}
