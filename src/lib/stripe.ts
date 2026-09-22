import "server-only";

import Stripe from "stripe";
import { isLocale, localeFromCountry, type Locale } from "@/i18n/config";
import { serverEnv } from "@/lib/env";

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!serverEnv.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  if (!client) client = new Stripe(serverEnv.stripeSecretKey);
  return client;
}

export function isStripeConfigured(): boolean {
  return Boolean(serverEnv.stripeSecretKey && serverEnv.stripeWebhookSecret);
}

/**
 * Verifies the `Stripe-Signature` header against the raw request body.
 * The body must be the untouched string Stripe sent, or verification fails.
 */
export async function verifyStripeEvent(rawBody: string, signature: string | null): Promise<Stripe.Event | null> {
  if (!signature || !serverEnv.stripeWebhookSecret) return null;
  try {
    return await stripe().webhooks.constructEventAsync(rawBody, signature, serverEnv.stripeWebhookSecret);
  } catch (err) {
    console.error("[stripe] signature verification failed", err instanceof Error ? err.message : err);
    return null;
  }
}

/** Metadata keys a checkout front-end (KashPay, our own links) may use for the locale. */
const LOCALE_KEYS = ["lang", "locale", "language", "idioma", "xcod"];

/**
 * Works out which language to write to and e-mail the buyer in.
 * Priority: explicit metadata → Stripe Checkout locale → billing country.
 */
export function localeFromSession(session: Stripe.Checkout.Session): Locale {
  const metadata = session.metadata ?? {};
  for (const key of LOCALE_KEYS) {
    const raw = metadata[key];
    if (raw) {
      const base = raw.trim().toLowerCase().split("-")[0];
      if (isLocale(base)) return base;
    }
  }
  const checkoutLocale = session.locale && session.locale !== "auto" ? session.locale.split("-")[0] : null;
  if (checkoutLocale && isLocale(checkoutLocale)) return checkoutLocale;
  return localeFromCountry(session.customer_details?.address?.country) ?? "en";
}

export function emailFromSession(session: Stripe.Checkout.Session): string | null {
  return session.customer_details?.email ?? session.customer_email ?? null;
}

/** The id we store as `transaction`, so refunds and disputes can find the buyer. */
export function transactionFromSession(session: Stripe.Checkout.Session): string {
  return typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? session.id);
}

export function transactionFromCharge(charge: Stripe.Charge): string | null {
  if (typeof charge.payment_intent === "string") return charge.payment_intent;
  return charge.payment_intent?.id ?? null;
}

export function emailFromCharge(charge: Stripe.Charge): string | null {
  return charge.billing_details?.email ?? charge.receipt_email ?? null;
}
