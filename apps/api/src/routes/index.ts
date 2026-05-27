import { Hono } from "hono";
import adminRoute from "./admin-route";
import characterRoute from "./character-route";
import feedbackRoute from "./feedback-route";
import healthRoute from "./health-route";
import storyRoute from "./story-route";
import usageRoute from "./usage-route";
import userRoute from "./user-route";
import webhookRoute from "./webhook-route";

const appRoutes = new Hono();

appRoutes.route("/health", healthRoute);
appRoutes.route("/webhooks", webhookRoute);
appRoutes.route("/users", userRoute);
appRoutes.route("/characters", characterRoute);
appRoutes.route("/stories", storyRoute);
appRoutes.route("/usage", usageRoute);
appRoutes.route("/feedback", feedbackRoute);
appRoutes.route("/admin", adminRoute);

export default appRoutes;
