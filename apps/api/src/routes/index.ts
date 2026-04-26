import { Hono } from "hono";
import adminRoute from "./admin-route";
import avatarRoute from "./avatar-route";
import characterRoute from "./character-route";
import feedbackRoute from "./feedback-route";
import healthRoute from "./health-route";
import storyRoute from "./story-route";
import userRoute from "./user-route";

const appRoutes = new Hono();

appRoutes.route("/health", healthRoute);
appRoutes.route("/users", userRoute);
appRoutes.route("/characters", characterRoute);
appRoutes.route("/stories", storyRoute);
appRoutes.route("/feedback", feedbackRoute);
appRoutes.route("/admin", adminRoute);
appRoutes.route("/admin/avatars", avatarRoute);

export default appRoutes;
