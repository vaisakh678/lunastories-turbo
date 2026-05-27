import type { UsageSummaryDTO } from "@repo/dto";
import type { APIResponse } from "@repo/types";
import { Hono } from "hono";

import { getUserIdFromCTX } from "../lib/helpers";
import { usageSummary } from "../services/usage-service";

// GET /api/v1/usage — current weekly story + audio quota for the signed-in
// user. Lets the paywall/home show remaining counts without generating.
const usageRoute = new Hono().get("/", async (c) => {
  const userId = getUserIdFromCTX(c);
  const summary = await usageSummary(userId);
  return c.json<APIResponse<UsageSummaryDTO>>({ data: summary });
});

export default usageRoute;
