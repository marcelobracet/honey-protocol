import { createRemoteJWKSet, jwtVerify } from "jose";

export interface AccessIdentity {
  email: string;
  sub: string;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksTeamDomain: string | null = null;

function getJwks(teamDomain: string) {
  if (!jwks || jwksTeamDomain !== teamDomain) {
    jwks = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`));
    jwksTeamDomain = teamDomain;
  }
  return jwks;
}

/**
 * Verifies a Cloudflare Access JWT (from the `Cf-Access-Jwt-Assertion` header
 * or the `CF_Authorization` cookie) against your team's public keys.
 *
 * Requires CF_ACCESS_TEAM_DOMAIN (e.g. "yourteam.cloudflareaccess.com") and
 * CF_ACCESS_AUD (the Access application's Audience tag) to be set. Returns
 * null when unconfigured or when the token fails verification.
 */
export async function verifyAccessJwt(token: string): Promise<AccessIdentity | null> {
  const teamDomain = process.env.CF_ACCESS_TEAM_DOMAIN;
  const aud = process.env.CF_ACCESS_AUD;
  if (!teamDomain || !aud) return null;

  try {
    const { payload } = await jwtVerify(token, getJwks(teamDomain), {
      audience: aud,
    });
    const email = typeof payload.email === "string" ? payload.email : null;
    if (!email) return null;
    return { email, sub: typeof payload.sub === "string" ? payload.sub : email };
  } catch {
    return null;
  }
}

export function isAccessConfigured(): boolean {
  return Boolean(process.env.CF_ACCESS_TEAM_DOMAIN && process.env.CF_ACCESS_AUD);
}
