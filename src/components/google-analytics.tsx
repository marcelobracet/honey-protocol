"use client";

import { useEffect, useSyncExternalStore } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, readConsentFromDocument } from "@/lib/consent";

function subscribe(cb: () => void) {
  window.addEventListener(CONSENT_EVENT, cb);
  return () => window.removeEventListener(CONSENT_EVENT, cb);
}

/**
 * GA4 via gtag.js, loaded only after cookie consent. Uses Consent Mode v2
 * defaults set to "granted" at load time because the script itself is
 * only injected once the visitor accepted. page_view is sent on every
 * client-side navigation (send_page_view is disabled to avoid doubles).
 */
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const consented = useSyncExternalStore(
    subscribe,
    () => readConsentFromDocument()?.marketing === true,
    () => false,
  );

  useEffect(() => {
    if (consented && measurementId && window.gtag) {
      window.gtag("event", "page_view", { page_path: pathname });
    }
  }, [pathname, consented, measurementId]);

  if (!consented || !measurementId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});gtag('js',new Date());gtag('config','${measurementId}',{send_page_view:false,anonymize_ip:true});gtag('event','page_view',{page_path:location.pathname});`}
      </Script>
    </>
  );
}
