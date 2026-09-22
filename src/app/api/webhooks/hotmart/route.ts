import { NextResponse, type NextRequest } from "next/server";
import { localeFromCountry, isLocale } from "@/i18n/config";
import { grantAccess, revokeAccess, sendMagicLink } from "@/lib/access";
import { sql } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { GRANT_EVENTS, REVOKE_EVENTS, isKnownProduct, verifyHottok, type HotmartWebhook } from "@/lib/hotmart";
import { sendPurchaseEvent } from "@/lib/meta-capi";

export const runtime = "nodejs";

/**
 * Hotmart webhook (v2.0). Configure in Hotmart → Tools → Webhook with this
 * URL and copy the "hottok" into HOTMART_HOTTOK.
 *
 * - Verifies the hottok header
 * - Stores every event (idempotent on Hotmart's event id)
 * - PURCHASE_APPROVED / COMPLETE → grant access + welcome e-mail with magic link
 * - REFUNDED / CHARGEBACK / CANCELED / PROTEST / EXPIRED → revoke access
 */
export async function POST(request: NextRequest) {
  if (!verifyHottok(request.headers.get("x-hotmart-hottok"))) {
    return NextResponse.json({ error: "invalid hottok" }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  let payload: HotmartWebhook;
  try {
    payload = (await request.json()) as HotmartWebhook;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!payload?.id || !payload?.event) {
    return NextResponse.json({ error: "missing id/event" }, { status: 400 });
  }

  const transaction = payload.data?.purchase?.transaction ?? null;

  // Idempotency: Hotmart retries on non-2xx, so a duplicate id is a no-op.
  const inserted = await sql()<{ id: number }[]>`
    insert into webhook_events (provider, event_id, event, transaction, payload)
    values ('hotmart', ${payload.id}, ${payload.event}, ${transaction}, ${sql().json(payload as never)})
    on conflict (provider, event_id) do nothing
    returning id
  `;
  if (inserted.length === 0) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  let error: string | null = null;
  try {
    if (!isKnownProduct(payload)) {
      error = "ignored: product not in HOTMART_PRODUCT_IDS";
    } else {
      await handleEvent(payload);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    console.error("[hotmart webhook]", payload.event, error);
  }

  await sql()`update webhook_events set processed_at = now(), error = ${error} where id = ${inserted[0].id}`;

  // Always 200 once stored: failures are visible in webhook_events.error and
  // can be replayed, while a 5xx would make Hotmart retry the same payload.
  return NextResponse.json({ ok: !error, error });
}

async function handleEvent(payload: HotmartWebhook) {
  const buyer = payload.data.buyer;
  const purchase = payload.data.purchase;
  const email = buyer?.email;
  if (!email) throw new Error("buyer e-mail missing");

  if (GRANT_EVENTS.has(payload.event)) {
    const xcod = purchase?.origin?.xcod;
    const country = purchase?.checkout_country?.iso ?? buyer?.address?.country_iso ?? null;
    const locale = isLocale(xcod) ? xcod : (localeFromCountry(country) ?? "en");
    const name = buyer?.name ?? [buyer?.first_name, buyer?.last_name].filter(Boolean).join(" ") ?? null;

    const result = await grantAccess({
      email,
      name: name || null,
      locale,
      country,
      transaction: purchase?.transaction ?? null,
      productId: payload.data.product?.id != null ? String(payload.data.product.id) : null,
    });

    // PURCHASE_COMPLETE follows APPROVED after the guarantee period; only
    // e-mail on the first grant so buyers don't get a second welcome.
    if (payload.event === "PURCHASE_APPROVED" || result.isNew) {
      await sendMagicLink({ email, locale: result.locale, kind: "welcome" });
    }

    if (payload.event === "PURCHASE_APPROVED" && purchase?.transaction) {
      await sendPurchaseEvent({
        email,
        value: purchase.price?.value ?? purchase.full_price?.value ?? null,
        currency: purchase.price?.currency_value ?? purchase.full_price?.currency_value ?? null,
        eventId: purchase.transaction,
        country,
      });
    }
    return;
  }

  if (REVOKE_EVENTS.has(payload.event)) {
    await revokeAccess(email, payload.event);
  }
  // Other events (BILLET_PRINTED, DELAYED, OUT_OF_SHOPPING_CART, ...) are only logged.
}
