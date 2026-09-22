import "server-only";

import postgres, { type Sql } from "postgres";
import { serverEnv } from "@/lib/env";

declare global {
  // Reused across hot reloads in dev and across invocations in serverless.
  var __honeySql: Sql | undefined;
}

/**
 * Postgres client (postgres.js). Works with Neon / Vercel Postgres and any
 * other Postgres. Use the pooled connection string on serverless platforms.
 */
export function sql(): Sql {
  if (!serverEnv.databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }
  if (!globalThis.__honeySql) {
    globalThis.__honeySql = postgres(serverEnv.databaseUrl, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false, // required for pooled connections (Neon pgbouncer)
    });
  }
  return globalThis.__honeySql;
}
