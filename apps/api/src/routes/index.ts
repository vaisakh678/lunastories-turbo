import { Hono } from "hono";
import characterRoute from "./character-route";
import feedbackRoute from "./feedback-route";
import healthRoute from "./health-route";
import storyRoute from "./story-route";

const appRoutes = new Hono();

appRoutes.route("/health", healthRoute);
appRoutes.route("/characters", characterRoute);
appRoutes.route("/stories", storyRoute);
appRoutes.route("/feedback", feedbackRoute);

export default appRoutes;
