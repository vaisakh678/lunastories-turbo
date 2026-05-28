import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

export * from "./schema";

// Pass DATABASE_URL through untouched. Appending `uselibpqcompat=true` (to
// silence a pg deprecation warning) breaks `sslmode=no-verify`: under libpq
// semantics that mode isn't recognized, so pg verifies the cert and rejects
// RDS's chain (SELF_SIGNED_CERT_IN_CHAIN). Plain `sslmode=no-verify` parses to
// `ssl: { rejectUnauthorized: false }`, which connects to RDS and is a no-op
// for the local (non-SSL) Postgres.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle({ client: pool, schema });

export default db;
