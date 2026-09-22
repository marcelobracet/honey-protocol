/**
 * Applies every db/migrations/*.sql file that hasn't been applied yet,
 * in filename order, recording each in `schema_migrations`.
 *
 *   npm run db:migrate
 *
 * This also runs as part of `npm run build`, so a deploy brings the schema
 * up to date without a manual step. When no connection string is configured
 * it exits successfully and does nothing, so a build before the database
 * exists still succeeds.
 *
 * Prefers an unpooled connection: DDL over a transaction pooler (Neon's
 * pgbouncer) can fail or apply against the wrong session.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });
config();

// Vercel's Neon integration injects the production connection string into
// preview builds as well, so a preview build used to migrate the live schema.
// Preview now only ever touches a database it was given explicitly.
const isPreview = process.env.VERCEL_ENV === "preview";

const url = isPreview
  ? process.env.PREVIEW_DATABASE_URL_UNPOOLED ?? process.env.PREVIEW_DATABASE_URL
  : process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL;

if (!url) {
  console.log(
    isPreview
      ? "[migrate] preview build with no PREVIEW_DATABASE_URL — skipping, production is left alone."
      : "[migrate] no DATABASE_URL configured — skipping.",
  );
  process.exit(0);
}

// Any 64-bit constant works; it just has to be the same in every deploy.
const LOCK_ID = 8927341150;

const sql = postgres(url, { max: 1, prepare: false });
const dir = join(process.cwd(), "db", "migrations");

async function main() {
  // Concurrent deploys would otherwise race to apply the same file.
  await sql`select pg_advisory_lock(${LOCK_ID})`;
  try {
    await sql`create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )`;

    const applied = new Set((await sql<{ name: string }[]>`select name from schema_migrations`).map((r) => r.name));
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) continue;
      const body = readFileSync(join(dir, file), "utf8");
      process.stdout.write(`[migrate] applying ${file}… `);
      await sql.begin(async (tx) => {
        await tx.unsafe(body);
        await tx`insert into schema_migrations (name) values (${file})`;
      });
      console.log("ok");
      count += 1;
    }
    console.log(count === 0 ? "[migrate] up to date." : `[migrate] applied ${count} migration(s).`);
  } finally {
    await sql`select pg_advisory_unlock(${LOCK_ID})`;
  }
}

main()
  .catch((err) => {
    console.error("[migrate] failed:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
