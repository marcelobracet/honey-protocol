"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Fires the same funnel event to every loaded tracker (Meta Pixel + GA4).
 * Trackers only exist after cookie consent, so this is a no-op otherwise.
 */
export function trackEvent(name: "PageView" | "ViewContent" | "InitiateCheckout" | "Lead", params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", name, params ?? {});
  const ga: Record<typeof name, string> = {
    PageView: "page_view",
    ViewContent: "view_item",
    InitiateCheckout: "begin_checkout",
    Lead: "generate_lead",
  };
  if (name !== "PageView") window.gtag?.("event", ga[name], params ?? {});
}
