"use client";

import { useEffect } from "react";

/**
 * "Back redirect": when the visitor presses the browser Back button on the
 * sales page, they land on `url` (e.g. a recovery offer or the VSL) instead
 * of leaving. Standard direct-response tactic; keep the destination honest
 * and on your own domain to stay within ad-platform policies.
 */
export function BackRedirect({ url }: { url: string }) {
  useEffect(() => {
    if (!url) return;
    let armed = false;
    const arm = () => {
      if (armed) return;
      armed = true;
      // Push a duplicate entry so the next "Back" lands on the current page,
      // which we intercept and replace with the redirect target.
      history.pushState({ hpBack: true }, "", location.href);
    };
    const onPop = () => {
      if (armed) location.replace(url);
    };
    // Arm only after a real interaction so scroll restoration / prefetch aren't affected.
    window.addEventListener("scroll", arm, { once: true, passive: true });
    window.addEventListener("pointerdown", arm, { once: true, passive: true });
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("scroll", arm);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("popstate", onPop);
    };
  }, [url]);
  return null;
}
