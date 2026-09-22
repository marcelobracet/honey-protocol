import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { grantAccess, revokeAccess, revokeAccessByTransaction, sendMagicLink } from "@/lib/access";
import { sql } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { sendPurchaseEvent } from "@/lib/meta-capi";
import {
  emailFromCharge,
  emailFromSession,
  isStripeConfigured,
  localeFromSession,
  transactionFromCharge,
  transactionFromSession,
  verifyStripeEvent,
} from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook. KashPay charges through your own Stripe account, so this is
 * the source of truth for access regardless of which checkout front-end sold it.
 *
 * Register at https://dashboard.stripe.com/webhooks pointing to
 * `https://<domain>/api/webhooks/stripe`, subscribing to the events below,
 * and copy the signing secret into STRIPE_WEBHOOK_SECRET.
 */
const GRANT_EVENTS = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);
const REVOKE_EVENTS = new Set(["charge.refunded", "charge.dispute.created", "charge.dispute.closed"]);

export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  // Signature verification needs the untouched body, so read it as text.
  const rawBody = await request.text();
  const event = await verifyStripeEvent(rawBody, request.headers.get("stripe-signature"));
  if (!event) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  // Idempotency: Stripe retries for up to three days and may deliver twice.
  const inserted = await sql()<{ id: number }[]>`
    insert into webhook_events (provider, event_id, event, payload)
    values ('stripe', ${event.id}, ${event.type}, ${sql().json(event as never)})
    on conflict (provider, event_id) do nothing
    returning id
  `;
  if (inserted.length === 0) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  let error: string | null = null;
  try {
    await handleEvent(event);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    console.error("[stripe webhook]", event.type, error);
  }

  await sql()`update webhook_events set processed_at = now(), error = ${error} where id = ${inserted[0].id}`;

  // Always 2xx once stored: a 5xx would make Stripe redeliver the same event,
  // while failures stay visible in webhook_events.error and can be replayed.
  return NextResponse.json({ ok: !error, error });
}

async function handleEvent(event: Stripe.Event) {
  if (GRANT_EVENTS.has(event.type)) {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") return; // unpaid or still processing

    const email = emailFromSession(session);
    if (!email) throw new Error("checkout session has no customer e-mail");

    const locale = localeFromSession(session);
    const transaction = transactionFromSession(session);

    const result = await grantAccess({
      email,
      name: session.customer_details?.name ?? null,
      locale,
      country: session.customer_details?.address?.country ?? null,
      transaction,
      productId: session.metadata?.product_id ?? null,
      source: "stripe",
    });

    // Access is already granted above, and the buyer normally lands straight
    // in the app through /api/checkout/return. The welcome e-mail is a
    // convenience for getting back in later, so a missing or broken e-mail
    // provider must not fail the event and trigger Stripe retries.
    try {
      await sendMagicLink({ email, locale: result.locale, kind: "welcome" });
    } catch (err) {
      console.error("[stripe webhook] welcome e-mail failed for", email, err);
    }

    await sendPurchaseEvent({
      email,
      // Stripe reports minor units (cents); Meta expects a decimal amount.
      value: session.amount_total != null ? session.amount_total / 100 : null,
      currency: session.currency?.toUpperCase() ?? null,
      eventId: transaction,
      country: session.customer_details?.address?.country ?? null,
    });
    return;
  }

  if (REVOKE_EVENTS.has(event.type)) {
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      // Partial refunds leave the product paid for; only a full refund revokes.
      if (charge.amount_refunded < charge.amount) return;
      await revokeFor(charge, "refunded");
      return;
    }

    const dispute = event.data.object as Stripe.Dispute;
    // A dispute resolved in our favour must not cost the buyer their access.
    if (event.type === "charge.dispute.closed" && dispute.status === "won") return;

    const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge.id;
    const paymentIntent = typeof dispute.payment_intent === "string" ? dispute.payment_intent : (dispute.payment_intent?.id ?? null);
    const reason = event.type === "charge.dispute.created" ? "dispute_opened" : `dispute_${dispute.status}`;

    if (paymentIntent && (await revokeAccessByTransaction(paymentIntent, reason))) return;
    throw new Error(`no entitlement matched dispute for charge ${chargeId}`);
  }
}

async function revokeFor(charge: Stripe.Charge, reason: string) {
  const transaction = transactionFromCharge(charge);
  if (transaction && (await revokeAccessByTransaction(transaction, reason))) return;
  // Older rows may predate the payment id, so fall back to the billing e-mail.
  const email = emailFromCharge(charge);
  if (!email) throw new Error(`no transaction or e-mail on charge ${charge.id}`);
  await revokeAccess(email, reason);
}
