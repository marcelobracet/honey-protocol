import { headers } from "next/headers";

/** Reads the identity forwarded by proxy.ts after Cloudflare Access verification. */
export async function getUserEmail(): Promise<string | null> {
  const h = await headers();
  return h.get("x-user-email");
}
