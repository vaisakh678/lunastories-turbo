import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(64).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(64).optional(),
});
