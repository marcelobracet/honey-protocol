export const CONSENT_COOKIE = "hp_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_EVENT = "hp:consent";

export interface ConsentState {
  v: number;
  marketing: boolean;
  ts: number;
}

export function parseConsent(raw: string | undefined | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentState>;
    if (typeof parsed.marketing !== "boolean" || parsed.v !== CONSENT_VERSION) return null;
    return { v: CONSENT_VERSION, marketing: parsed.marketing, ts: typeof parsed.ts === "number" ? parsed.ts : 0 };
  } catch {
    return null;
  }
}

export function readConsentFromDocument(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  return parseConsent(match?.slice(CONSENT_COOKIE.length + 1));
}

export function writeConsentToDocument(marketing: boolean): ConsentState {
  const state: ConsentState = { v: CONSENT_VERSION, marketing, ts: Date.now() };
  const value = encodeURIComponent(JSON.stringify(state));
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
  return state;
}
