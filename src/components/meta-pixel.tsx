"use client";

import { useEffect, useSyncExternalStore } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, readConsentFromDocument } from "@/lib/consent";
import { trackEvent } from "@/lib/analytics";

function subscribe(cb: () => void) {
  window.addEventListener(CONSENT_EVENT, cb);
  return () => window.removeEventListener(CONSENT_EVENT, cb);
}

/**
 * Loads the Meta Pixel only after marketing consent. PageView is tracked on
 * every client-side navigation.
 */
export function MetaPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const consented = useSyncExternalStore(
    subscribe,
    () => readConsentFromDocument()?.marketing === true,
    () => false,
  );

  useEffect(() => {
    if (consented && pixelId) trackEvent("PageView");
  }, [pathname, consented, pixelId]);

  if (!consented || !pixelId) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');`}
    </Script>
  );
}
