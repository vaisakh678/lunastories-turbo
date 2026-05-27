import db, { userSchema } from "@repo/db";
import { eq } from "drizzle-orm";

import { PaymentRequired } from "../lib/api-error";
import { logger } from "../lib/logger";

/**
 * The subset of a RevenueCat webhook event we act on.
 * Full payload: https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
 */
export interface RevenueCatEvent {
  type: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  product_id?: string;
  store?: string; // APP_STORE | PLAY_STORE | AMAZON | STRIPE | PROMOTIONAL
  environment?: string; // PRODUCTION | SANDBOX
  period_type?: string; // NORMAL | TRIAL | INTRO
  expiration_at_ms?: number | null;
  event_timestamp_ms?: number;
}

type SubscriptionStatus =
  | "active"
  | "trialing"
  | "in_grace_period"
  | "cancelled"
  | "expired"
  | "none";

type SubscriptionStore =
  | "app_store"
  | "play_store"
  | "amazon"
  | "stripe"
  | "promotional";

// RevenueCat's app_user_id is set to our users.id (a UUID) on login.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapStore(store?: string): SubscriptionStore | null {
  switch ((store ?? "").toUpperCase()) {
    case "APP_STORE":
    case "MAC_APP_STORE":
      return "app_store";
    case "PLAY_STORE":
      return "play_store";
    case "AMAZON":
      return "amazon";
    case "STRIPE":
      return "stripe";
    case "PROMOTIONAL":
      return "promotional";
    default:
      return null;
  }
}

/**
 * Maps an event type to the resulting status, or null to ignore the event
 * (e.g. TEST, TRANSFER, NON_RENEWING_PURCHASE — no recurring entitlement change).
 */
function statusForEvent(
  type: string,
  periodType?: string,
): SubscriptionStatus | null {
  const isTrial = (periodType ?? "").toUpperCase() === "TRIAL";
  switch (type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION":
    case "PRODUCT_CHANGE":
    case "SUBSCRIPTION_EXTENDED":
      return isTrial ? "trialing" : "active";
    case "CANCELLATION":
      // Auto-renew turned off (or refund). Still entitled until expiry.
      return "cancelled";
    case "BILLING_ISSUE":
      // In grace period — still entitled while RevenueCat retries billing.
      return "in_grace_period";
    case "EXPIRATION":
    case "SUBSCRIPTION_PAUSED":
      return "expired";
    default:
      return null;
  }
}

async function resolveUserId(event: RevenueCatEvent): Promise<string | null> {
  const candidates = [
    event.app_user_id,
    event.original_app_user_id,
    ...(event.aliases ?? []),
  ].filter((id): id is string => !!id && UUID_RE.test(id));

  for (const id of candidates) {
    const [user] = await db
      .select({ id: userSchema.id })
      .from(userSchema)
      .where(eq(userSchema.id, id))
      .limit(1);
    if (user) return user.id;
  }
  return null;
}

/**
 * Applies a RevenueCat webhook event to the user's subscription columns.
 * Idempotent: stale or out-of-order redeliveries (older event_timestamp_ms
 * than what we've already applied) are skipped.
 */
export async function applyRevenueCatEvent(
  event: RevenueCatEvent,
): Promise<void> {
  const status = statusForEvent(event.type, event.period_type);
  if (status === null) {
    logger.info({ type: event.type }, "RevenueCat event ignored (no state change)");
    return;
  }

  const userId = await resolveUserId(event);
  if (!userId) {
    const ctx = {
      appUserId: event.app_user_id,
      type: event.type,
      environment: event.environment,
    };
    // We return normally (200) either way so RevenueCat doesn't retry — a
    // genuinely missing/deleted user will never resolve. But a PRODUCTION
    // event we can't tie to a user means a real purchase went unrecorded
    // (id mismatch, or the user row is missing), so log it loudly for alerts.
    // Sandbox misses are routine cross-environment/test noise.
    if ((event.environment ?? "").toUpperCase() === "PRODUCTION") {
      logger.error(
        ctx,
        "RevenueCat PRODUCTION event for unknown user — ignoring (investigate)",
      );
    } else {
      logger.info(ctx, "RevenueCat sandbox event for unknown user — ignoring");
    }
    return;
  }

  const eventAt = event.event_timestamp_ms
    ? new Date(event.event_timestamp_ms)
    : new Date();

  const [current] = await db
    .select({ eventAt: userSchema.subscriptionEventAt })
    .from(userSchema)
    .where(eq(userSchema.id, userId))
    .limit(1);

  if (current?.eventAt && current.eventAt >= eventAt) {
    logger.info(
      { userId, type: event.type },
      "RevenueCat event skipped (stale/duplicate)",
    );
    return;
  }

  const willRenew =
    status === "active" || status === "trialing" || status === "in_grace_period";

  await db
    .update(userSchema)
    .set({
      subscriptionStatus: status,
      subscriptionProductId: event.product_id ?? null,
      subscriptionStore: mapStore(event.store),
      subscriptionEnvironment: event.environment
        ? event.environment.toLowerCase()
        : null,
      subscriptionExpiresAt: event.expiration_at_ms
        ? new Date(event.expiration_at_ms)
        : null,
      subscriptionWillRenew: willRenew,
      subscriptionEventAt: eventAt,
    })
    .where(eq(userSchema.id, userId));

  logger.info({ userId, type: event.type, status }, "RevenueCat subscription synced");
}

/**
 * Whether a user currently has an entitlement. "cancelled" and
 * "in_grace_period" still count until the paid period actually ends.
 * Reusable by feature gating (e.g. story-generation limits).
 */
export function isSubscriptionActive(user: {
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt: Date | null;
}): boolean {
  if (user.subscriptionStatus === "none" || user.subscriptionStatus === "expired") {
    return false;
  }
  if (!user.subscriptionExpiresAt) return false;
  return user.subscriptionExpiresAt.getTime() > Date.now();
}

/**
 * Throws 402 if the user doesn't have an active subscription. Used to gate
 * generation (stories + audio) behind Luna Pro.
 */
export async function assertActiveSubscription(userId: string): Promise<void> {
  const [user] = await db
    .select({
      subscriptionStatus: userSchema.subscriptionStatus,
      subscriptionExpiresAt: userSchema.subscriptionExpiresAt,
    })
    .from(userSchema)
    .where(eq(userSchema.id, userId))
    .limit(1);

  if (!user || !isSubscriptionActive(user)) {
    throw PaymentRequired(
      "An active Luna Pro subscription is required to create stories.",
    );
  }
}
