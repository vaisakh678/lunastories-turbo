import { Hono } from "hono";
import characterRoute from "./character-route";
import healthRoute from "./health-route";
import storyRoute from "./story-route";

const appRoutes = new Hono();

appRoutes.route("/health", healthRoute);
appRoutes.route("/characters", characterRoute);
appRoutes.route("/stories", storyRoute);

export default appRoutes;
