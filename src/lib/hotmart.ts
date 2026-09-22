import "server-only";

import { timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env";

/**
 * Hotmart Webhook 2.0 payload (subset we rely on).
 * Docs: https://developers.hotmart.com/docs/en/webhook/
 */
export interface HotmartWebhook {
  id: string;
  creation_date: number;
  event: string;
  version: string;
  data: {
    product?: { id?: number | string; ucode?: string; name?: string };
    buyer?: {
      email?: string;
      name?: string;
      first_name?: string;
      last_name?: string;
      address?: { country?: string; country_iso?: string };
    };
    purchase?: {
      transaction?: string;
      status?: string;
      approved_date?: number;
      order_date?: number;
      price?: { value?: number; currency_value?: string };
      full_price?: { value?: number; currency_value?: string };
      checkout_country?: { name?: string; iso?: string };
      offer?: { code?: string };
      origin?: { xcod?: string; src?: string; sck?: string };
      sckPaymentLink?: string;
    };
    subscription?: { status?: string; subscriber?: { code?: string } };
  };
}

export const GRANT_EVENTS = new Set(["PURCHASE_APPROVED", "PURCHASE_COMPLETE"]);
export const REVOKE_EVENTS = new Set([
  "PURCHASE_REFUNDED",
  "PURCHASE_CHARGEBACK",
  "PURCHASE_CANCELED",
  "PURCHASE_PROTEST",
  "PURCHASE_EXPIRED",
  "SUBSCRIPTION_CANCELLATION",
]);

/** Constant-time comparison of the `X-HOTMART-HOTTOK` header with our secret. */
export function verifyHottok(header: string | null): boolean {
  const expected = serverEnv.hotmartHottok;
  if (!expected || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isKnownProduct(payload: HotmartWebhook): boolean {
  const allowed = serverEnv.hotmartProductIds;
  if (allowed.length === 0) return true; // no filter configured
  const id = payload.data.product?.id;
  const ucode = payload.data.product?.ucode;
  return allowed.includes(String(id)) || (ucode ? allowed.includes(ucode) : false);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
