import { zValidator } from "@hono/zod-validator";
import type { APIResponse } from "@repo/types";
import { createFeedbackSchema } from "@repo/zod";
import { Hono } from "hono";

import { getUserIdFromCTX } from "../lib/helpers";
import { createFeedback } from "../services/feedback-service";

const feedbackRoute = new Hono().post(
  "/",
  zValidator("json", createFeedbackSchema),
  async (c) => {
    const data = c.req.valid("json");
    const userId = getUserIdFromCTX(c);

    const feedback = await createFeedback(userId, data);
    return c.json<APIResponse<typeof feedback>>({ data: feedback });
  },
);

export default feedbackRoute;
