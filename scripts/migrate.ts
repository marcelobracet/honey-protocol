/**
 * Applies every db/migrations/*.sql file that hasn't been applied yet,
 * in filename order, recording each in `schema_migrations`.
 *
 *   npm run db:migrate
 *
 * Reads DATABASE_URL (or POSTGRES_URL) from the environment / .env.local.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });
config();

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local or the environment.");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });
const dir = join(process.cwd(), "db", "migrations");

async function main() {
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
    process.stdout.write(`applying ${file}… `);
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into schema_migrations (name) values (${file})`;
    });
    console.log("ok");
    count += 1;
  }
  console.log(count === 0 ? "nothing to apply — database is up to date." : `applied ${count} migration(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
