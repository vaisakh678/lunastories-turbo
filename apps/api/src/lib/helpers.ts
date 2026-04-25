import type { Context } from "hono";

export function getUserIdFromCTX(c: Context): string {
  return c.get("userId") as string;
}
