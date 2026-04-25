import { z } from "zod";

export const userRoleSchema = z.enum(["user", "admin"]);

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(200).optional(),
});

export const adminStoryListQuerySchema = adminListQuerySchema.extend({
  status: z.enum(["pending", "generating", "ready", "failed"]).optional(),
  modeKey: z.string().trim().min(1).max(64).optional(),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
export type AdminStoryListQuery = z.infer<typeof adminStoryListQuerySchema>;
