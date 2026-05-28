import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// NB: pass DATABASE_URL through untouched. We previously appended
// `uselibpqcompat=true` to silence a pg deprecation warning, but under libpq
// semantics `sslmode=no-verify` isn't recognized, so pg verifies the cert and
// rejects RDS's chain (SELF_SIGNED_CERT_IN_CHAIN). Plain `sslmode=no-verify`
// parses to `ssl: { rejectUnauthorized: false }`, which connects to RDS and is
// a no-op for the local (non-SSL) Postgres.
export default defineConfig({
  out: "./migrations",
  schema: "./src/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
