import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { sql } from "@/lib/db";

export type TokenKind = "welcome" | "login";

/** Welcome links are clicked days later; login links should be short-lived. */
const TTL_MS: Record<TokenKind, number> = {
  welcome: 1000 * 60 * 60 * 24 * 7,
  login: 1000 * 60 * 60,
};

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a single-use token and returns the raw value (only the hash is stored). */
export async function createLoginToken(email: string, kind: TokenKind, nextPath = "/app"): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_MS[kind]);
  await sql()`
    insert into login_tokens (email, token_hash, kind, next_path, expires_at)
    values (${email}, ${hash(token)}, ${kind}, ${nextPath}, ${expiresAt})
  `;
  return token;
}

export interface ConsumedToken {
  email: string;
  kind: TokenKind;
  nextPath: string;
}

/**
 * Marks the token as used and returns its data, or null if it's unknown,
 * expired or already used. Atomic, so two concurrent clicks can't both win.
 */
export async function consumeLoginToken(token: string): Promise<ConsumedToken | null> {
  if (!token || token.length > 200) return null;
  const rows = await sql()<{ email: string; kind: TokenKind; next_path: string }[]>`
    update login_tokens
       set used_at = now()
     where token_hash = ${hash(token)}
       and used_at is null
       and expires_at > now()
    returning email, kind, next_path
  `;
  const row = rows[0];
  return row ? { email: row.email, kind: row.kind, nextPath: row.next_path } : null;
}

/** Housekeeping: drop tokens older than 30 days. Called from the cron route. */
export async function purgeOldTokens(): Promise<void> {
  await sql()`delete from login_tokens where created_at < now() - interval '30 days'`;
}
