import { Hono } from "hono";
import characterRoute from "./character-route";
import healthRoute from "./health-route";

const appRoutes = new Hono();

appRoutes.route("/health", healthRoute);
appRoutes.route("/characters", characterRoute);

export default appRoutes;
