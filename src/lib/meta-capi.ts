import "server-only";

import { createHash } from "node:crypto";
import { publicEnv, serverEnv } from "@/lib/env";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Sends a server-side Purchase event to Meta's Conversions API. Optional:
 * only runs when NEXT_PUBLIC_META_PIXEL_ID and META_CAPI_TOKEN are set.
 * The event_id (Hotmart transaction) lets Meta deduplicate against a
 * browser-side Purchase event fired from the Hotmart thank-you page.
 */
export async function sendPurchaseEvent(input: {
  email: string;
  value?: number | null;
  currency?: string | null;
  eventId: string;
  country?: string | null;
}): Promise<void> {
  if (!publicEnv.metaPixelId || !serverEnv.metaCapiToken) return;
  const body = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: publicEnv.siteUrl,
        user_data: {
          em: [sha256(input.email)],
          ...(input.country ? { country: [sha256(input.country)] } : {}),
        },
        custom_data: {
          value: input.value ?? 0,
          currency: input.currency ?? "USD",
        },
      },
    ],
  };
  try {
    await fetch(`https://graph.facebook.com/v21.0/${publicEnv.metaPixelId}/events?access_token=${serverEnv.metaCapiToken}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[meta-capi] purchase event failed", err);
  }
}
