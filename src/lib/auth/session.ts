import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "hp_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  sub: string; // user id
  email: string;
}

export interface VerifiedSession extends SessionPayload {
  /** Expiry as a Unix timestamp in seconds, used to decide when to renew. */
  exp: number;
}

/** Renew once the token is past half its life, so an active user never expires. */
export const SESSION_RENEW_AFTER = SESSION_MAX_AGE / 2;

function secretKey(secret: string): Uint8Array {
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long.");
  }
  return new TextEncoder().encode(secret);
}

/** Signs a session JWT. Edge-compatible (jose), no database round-trip. */
export async function signSession(payload: SessionPayload, secret: string): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey(secret));
}

/** Returns the payload if the token is valid and unexpired, else null. */
export async function verifySession(token: string | undefined, secret: string): Promise<VerifiedSession | null> {
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(secret), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.email !== "string" || typeof payload.exp !== "number") return null;
    return { sub: payload.sub, email: payload.email, exp: payload.exp };
  } catch {
    return null;
  }
}

/** True when the token is close enough to expiry that it should be re-issued. */
export function shouldRenew(session: VerifiedSession, now = Date.now()): boolean {
  return session.exp - Math.floor(now / 1000) < SESSION_RENEW_AFTER;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

/**
 * A readable companion to the session cookie, carrying no secret and no
 * identity — only the fact that this browser has an account.
 *
 * The sales page is prerendered, and reading the httpOnly session on the
 * server would make it dynamic for every visitor, almost all of whom have
 * never bought. This flag lets the page stay static and let a tiny client
 * component greet the buyer instead.
 */
export const MEMBER_HINT_COOKIE = "hp_member";

export const memberHintCookieOptions = {
  httpOnly: false,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
