import type { APIResponse } from "@repo/types";
import { Hono } from "hono";

import { env } from "../config/env";
import { logger } from "../lib/logger";
import {
  applyRevenueCatEvent,
  type RevenueCatEvent,
} from "../services/subscription-service";

// Mounted at /api/v1/webhooks and exempted from Clerk auth in app.ts —
// these are server-to-server calls authenticated by a shared secret instead.
const webhookRoute = new Hono().post("/revenuecat", async (c) => {
  // RevenueCat sends the configured value verbatim in the Authorization
  // header. Fail closed if the secret is unset or doesn't match.
  const expected = env.REVENUECAT_WEBHOOK_AUTH_TOKEN;
  if (!expected || c.req.header("authorization") !== expected) {
    logger.warn("RevenueCat webhook rejected: missing/invalid Authorization");
    return c.json<APIResponse<null>>({ data: null, error: "Unauthorized" }, 401);
  }

  let body: { event?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json<APIResponse<null>>({ data: null, error: "Invalid JSON" }, 400);
  }

  const event = body?.event;
  if (!event || typeof event !== "object") {
    return c.json<APIResponse<null>>({ data: null, error: "Missing event" }, 400);
  }

  try {
    await applyRevenueCatEvent(event as RevenueCatEvent);
  } catch (err) {
    // Return 5xx so RevenueCat retries transient failures (e.g. DB blips).
    // Unknown users / ignored event types are handled inside the service and
    // return normally, so reaching here means an unexpected error.
    logger.error({ err }, "Failed to process RevenueCat webhook");
    return c.json<APIResponse<null>>(
      { data: null, error: "Failed to process event" },
      500,
    );
  }

  return c.json<APIResponse<{ received: boolean }>>({
    data: { received: true },
  });
});

export default webhookRoute;
