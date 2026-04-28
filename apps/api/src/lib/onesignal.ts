import * as OneSignal from "@onesignal/node-onesignal";

import { env } from "../config/env";
import { logger } from "./logger";

interface StoryReadyPayload {
  userId: string;
  storyId: string;
  title: string | null | undefined;
}

/**
 * OneSignal client. Built lazily so the SDK isn't constructed at import
 * time when notifications aren't configured for this environment.
 */
let cachedClient: OneSignal.DefaultApi | null = null;

function getClient(): OneSignal.DefaultApi | null {
  if (!env.ONESIGNAL_REST_API_KEY) return null;
  if (cachedClient) return cachedClient;

  const config = OneSignal.createConfiguration({
    restApiKey: env.ONESIGNAL_REST_API_KEY,
  });
  cachedClient = new OneSignal.DefaultApi(config);
  return cachedClient;
}

/**
 * Fire a "your story is ready" push to a single user via the OneSignal
 * Node SDK, targeting their `external_id` alias (which the iOS client
 * sets to the user's internal DB id).
 *
 * Fire-and-forget: callers should NOT await this in the hot path of the
 * story-creation request. We swallow all errors and just log them — a
 * missed notification shouldn't fail the story creation itself.
 */
export async function sendStoryReadyNotification(
  payload: StoryReadyPayload,
): Promise<void> {
  const client = getClient();
  if (!client || !env.ONESIGNAL_APP_ID) {
    // Notifications not configured for this environment — quietly skip.
    return;
  }

  const titleSuffix = payload.title ? `: ${payload.title}` : "";

  const notification = new OneSignal.Notification();
  notification.app_id = env.ONESIGNAL_APP_ID;
  notification.target_channel = "push";
  notification.include_aliases = { external_id: [payload.userId] };
  notification.headings = { en: "Your story is ready ✨" };
  notification.contents = { en: `Tap to read${titleSuffix}` };
  notification.data = { storyId: payload.storyId };
  notification.ios_sound = "default";

  try {
    const response = await client.createNotification(notification);
    if (response.errors) {
      logger.warn(
        { errors: response.errors, storyId: payload.storyId },
        "OneSignal push returned errors",
      );
    } else {
      logger.debug(
        { notificationId: response.id, storyId: payload.storyId },
        "Story-ready push dispatched",
      );
    }
  } catch (err) {
    logger.warn(
      { err, storyId: payload.storyId },
      "Failed to dispatch OneSignal push",
    );
  }
}
