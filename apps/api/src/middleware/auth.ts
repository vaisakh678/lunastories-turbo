import type { Context, Next } from "hono";

import { findOrCreateUserByClerkId, verifyClerkSession } from "../services/auth-service";

export async function authMiddleware(c: Context, next: Next) {
	console.log("authMiddleware called");
	const header = c.req.header("authorization");
	if (!header?.startsWith("Bearer ")) {
		console.log("No Bearer token found in authorization header");
		return c.json({ data: null, error: "Unauthorized" }, 401);
	}
	const token = header.slice(7).trim();
	if (!token) {
		console.log("No token found after Bearer in authorization header");
		return c.json({ data: null, error: "Unauthorized" }, 401);
	}

	const clerkId = await verifyClerkSession(token);
	console.log(`Clerk session verified, clerkId: ${clerkId}`);
	const userId = await findOrCreateUserByClerkId(clerkId);
	console.log(`User found or created, userId: ${userId}`);
	c.set("userId", userId);
	await next();
}
