"use client";

import { useEffect } from "react";
import { UTM_KEYS, UTM_STORAGE_KEY, type UtmParams } from "@/lib/checkout";

/**
 * Stores utm_* / fbclid from the landing URL in sessionStorage so they can be
 * appended to the checkout link even after the visitor navigates around.
 * First-touch wins for the session.
 */
export function UtmCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const found: UtmParams = {};
      for (const key of UTM_KEYS) {
        const value = params.get(key);
        if (value) found[key] = value.slice(0, 200);
      }
      if (Object.keys(found).length === 0) return;
      if (!sessionStorage.getItem(UTM_STORAGE_KEY)) {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(found));
      }
    } catch {
      // storage blocked — checkout link simply won't carry UTMs
    }
  }, []);
  return null;
}
