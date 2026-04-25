import { z } from "zod";

try {
  process.loadEnvFile();
} catch {
  // .env not found — fine if required vars are already in process.env
}

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  // PEM public key from Clerk Dashboard → API Keys → "JWT public key".
  // Pasted as a single line — `\n` escapes are unfolded back into real newlines.
  CLERK_JWT_KEY: z
    .string()
    .min(1)
    .transform((s) => s.replace(/\\n/g, "\n")),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
