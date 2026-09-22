"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Locale } from "@/i18n/config";
import { CheckoutButton } from "@/components/landing/checkout-button";

const REVEAL_KEY = "hp_vsl_revealed";

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|m3u8|mov)(\?|$)/i.test(url);
}

/**
 * Video + delayed CTA. The timer starts when the page loads (embeds don't
 * expose playback reliably); once revealed, the CTA stays revealed for that
 * visitor so a reload doesn't restart the wait.
 */
export function VslPlayer({
  locale,
  videoUrl,
  delaySeconds,
  checkoutUrl,
  ctaLabel,
  ctaHint,
  unmuteLabel,
}: {
  locale: Locale;
  videoUrl: string;
  delaySeconds: number;
  checkoutUrl: string;
  ctaLabel: string;
  ctaHint: string;
  unmuteLabel: string;
}) {
  const [revealed, setRevealed] = useState(delaySeconds === 0);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (delaySeconds === 0) return;
    let already = false;
    try {
      already = localStorage.getItem(REVEAL_KEY) === "1";
    } catch {
      // ignore
    }
    if (already) {
      const id = window.setTimeout(() => setRevealed(true), 0);
      return () => window.clearTimeout(id);
    }
    const timer = window.setTimeout(() => {
      setRevealed(true);
      try {
        localStorage.setItem(REVEAL_KEY, "1");
      } catch {
        // ignore
      }
    }, delaySeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [delaySeconds]);

  function unmute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0;
    void v.play();
    setMuted(false);
  }

  return (
    <div>
      <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-[22px] border border-honey-line bg-black shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]">
        {!videoUrl ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-[13px] text-honey-text-faint">VSL_VIDEO_URL</div>
        ) : isDirectVideo(videoUrl) ? (
          <>
            <video ref={videoRef} src={videoUrl} autoPlay muted playsInline className="h-full w-full object-cover" />
            {muted ? (
              <button
                type="button"
                onClick={unmute}
                className="absolute inset-0 flex items-center justify-center bg-black/40 font-body text-[15px] font-extrabold text-honey-text"
              >
                <span className="rounded-2xl border border-honey-gold/50 bg-honey-bg/80 px-5 py-3 shadow-lg">{unmuteLabel}</span>
              </button>
            ) : null}
          </>
        ) : (
          <iframe
            src={videoUrl}
            title="VSL"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            className="h-full w-full"
          />
        )}
      </div>

      <AnimatePresence>
        {revealed ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-6 max-w-[480px]"
          >
            <CheckoutButton locale={locale} baseUrl={checkoutUrl} label={ctaLabel} />
            <p className="mt-3 text-[12px] font-semibold text-honey-text-faint">{ctaHint}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
