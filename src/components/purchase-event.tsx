"use client";

import { useEffect, useSyncExternalStore } from "react";
import { CONSENT_EVENT, readConsentFromDocument } from "@/lib/consent";

function subscribe(cb: () => void) {
  window.addEventListener(CONSENT_EVENT, cb);
  return () => window.removeEventListener(CONSENT_EVENT, cb);
}

/**
 * Browser-side Purchase event on the thank-you page. Uses the Hotmart
 * transaction as event id so Meta deduplicates it against the server-side
 * CAPI event sent by the webhook. Fires once per transaction per browser.
 */
export function PurchaseEvent({ transaction }: { transaction: string }) {
  const consented = useSyncExternalStore(subscribe, () => readConsentFromDocument()?.marketing === true, () => false);

  useEffect(() => {
    if (!consented) return;
    const key = `hp_purchase_${transaction || "unknown"}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // fire anyway
    }
    const fire = () => {
      if (transaction) window.fbq?.("track", "Purchase", {}, { eventID: transaction });
      else window.fbq?.("track", "Purchase", {});
      window.gtag?.("event", "purchase", { transaction_id: transaction || undefined });
    };
    // Trackers load asynchronously after consent; retry briefly until present.
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (window.fbq || window.gtag || tries > 20) {
        window.clearInterval(timer);
        fire();
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [consented, transaction]);

  return null;
}
