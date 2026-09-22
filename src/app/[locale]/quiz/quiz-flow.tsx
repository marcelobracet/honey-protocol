"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { fill } from "@/i18n/fill";
import { QUIZ_SEGMENT_KEY, segmentFor, type QuizAnswers } from "@/lib/quiz";
import { trackEvent } from "@/lib/analytics";
import { saveQuizLead } from "./actions";

type Step = { kind: "intro" } | { kind: "question"; index: number } | { kind: "capture" } | { kind: "result" };

export function QuizFlow({ locale, text, vslPath }: { locale: Locale; text: Dictionary["quiz"]; vslPath: string }) {
  const [step, setStep] = useState<Step>({ kind: "intro" });
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [email, setEmail] = useState("");
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const total = text.questions.length;
  const segment = useMemo(() => segmentFor(answers), [answers]);
  const diagnosis = text.result.segments[segment] ?? Object.values(text.result.segments)[0];

  function answer(questionId: string, value: string) {
    const next = { ...answers, [questionId]: value };
    setAnswers(next);
    const index = text.questions.findIndex((q) => q.id === questionId);
    if (index < total - 1) setStep({ kind: "question", index: index + 1 });
    else setStep({ kind: "capture" });
  }

  function goBack() {
    if (step.kind === "question" && step.index > 0) setStep({ kind: "question", index: step.index - 1 });
    else if (step.kind === "question") setStep({ kind: "intro" });
    else if (step.kind === "capture") setStep({ kind: "question", index: total - 1 });
  }

  function finish(withEmail: boolean) {
    setError(null);
    if (withEmail) {
      if (!email.trim()) return setError(text.capture.invalidEmail);
      if (!consented) return setError(text.capture.consentRequired);
    }
    start(async () => {
      const res = await saveQuizLead({
        locale,
        answers,
        email: withEmail ? email : null,
        consented: withEmail && consented,
      });
      if (res.status === "error" && res.code === "invalid" && withEmail) {
        setError(text.capture.invalidEmail);
        return;
      }
      // A storage failure must not cost the visitor the result they answered for.
      if (withEmail && res.status === "ok") trackEvent("Lead");
      try {
        sessionStorage.setItem(QUIZ_SEGMENT_KEY, segment);
      } catch {
        // Private mode: the segment just won't reach the checkout URL.
      }
      setStep({ kind: "result" });
    });
  }

  // Carries the diagnosis into the VSL and onward into the checkout URL, so
  // the ad report shows which pattern actually converts.
  const vslHref = `${vslPath}?utm_content=quiz_${segment}&utm_term=quiz`;

  const card = "rounded-[26px] border border-honey-line bg-gradient-to-b from-honey-surface to-honey-surface-2 p-6 sm:p-8";

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step.kind === "question" ? `q${step.index}` : step.kind}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {step.kind === "intro" ? (
            <div className={`${card} text-center`}>
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-honey-sage">{text.eyebrow}</div>
              <h1 className="mb-3 font-display text-[28px] font-medium leading-tight text-honey-text sm:text-[34px]">{text.title}</h1>
              <p className="mb-7 text-[15px] leading-relaxed text-honey-text-dim">{text.subtitle}</p>
              <button
                type="button"
                onClick={() => setStep({ kind: "question", index: 0 })}
                className="w-full rounded-2xl bg-gradient-to-b from-honey-gold-light to-honey-gold px-5 py-4 text-[15px] font-extrabold uppercase tracking-[0.04em] text-[#2a1a08] shadow-[0_16px_32px_-10px_rgba(227,166,62,0.55)]"
              >
                {text.start}
              </button>
            </div>
          ) : null}

          {step.kind === "question" ? (
            <div className={card}>
              <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-honey-line">
                <div className="h-full rounded-full bg-honey-gold transition-all" style={{ width: `${((step.index + 1) / total) * 100}%` }} />
              </div>
              <div className="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-honey-sage">
                {fill(text.progress, { n: step.index + 1, total })}
              </div>
              <h2 className="mb-6 font-display text-[23px] font-medium leading-tight text-honey-text sm:text-[26px]">
                {text.questions[step.index].title}
              </h2>
              <div className="flex flex-col gap-2.5">
                {text.questions[step.index].options.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => answer(text.questions[step.index].id, o.value)}
                    className={`rounded-2xl border px-4 py-3.5 text-left text-[14.5px] font-semibold transition-colors ${
                      answers[text.questions[step.index].id] === o.value
                        ? "border-honey-gold/60 bg-honey-gold/15 text-honey-text"
                        : "border-honey-line bg-honey-surface text-honey-text-dim hover:border-honey-gold/40 hover:text-honey-text"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={goBack} className="mt-5 text-[12.5px] font-semibold text-honey-text-faint">
                ← {text.back}
              </button>
            </div>
          ) : null}

          {step.kind === "capture" ? (
            <div className={card}>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-honey-sage">{text.capture.eyebrow}</div>
              <h2 className="mb-2 font-display text-[24px] font-medium leading-tight text-honey-text">{text.capture.title}</h2>
              <p className="mb-5 text-[14px] leading-relaxed text-honey-text-dim">{text.capture.subtitle}</p>

              <label className="mb-3 flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-honey-sage">
                {text.capture.emailLabel}
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={text.capture.emailPlaceholder}
                  className="rounded-xl border border-honey-line bg-[#1c1006] px-4 py-3.5 font-body text-[15px] font-medium normal-case tracking-normal text-honey-text outline-none placeholder:text-honey-text-faint focus:border-honey-gold/60"
                />
              </label>

              <label className="mb-4 flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-relaxed text-honey-text-dim">
                <input
                  type="checkbox"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-honey-gold"
                />
                <span>{text.capture.consent}</span>
              </label>

              {error ? (
                <p className="mb-3 text-[12.5px] font-semibold text-honey-rust" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => finish(true)}
                disabled={pending}
                className="w-full rounded-2xl bg-gradient-to-b from-honey-gold-light to-honey-gold px-5 py-4 text-[15px] font-extrabold text-[#2a1a08] disabled:opacity-60"
              >
                {pending ? text.capture.submitting : text.capture.submit}
              </button>
              <button
                type="button"
                onClick={() => finish(false)}
                disabled={pending}
                className="mt-3 w-full text-[12.5px] font-semibold text-honey-text-faint underline underline-offset-2"
              >
                {text.capture.skip}
              </button>
            </div>
          ) : null}

          {step.kind === "result" ? (
            <div className={card}>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-honey-sage">{text.result.eyebrow}</div>
              <h2 className="mb-5 font-display text-[22px] font-medium leading-tight text-honey-text-dim">{text.result.title}</h2>
              <h3 className="mb-3 font-display text-[26px] font-medium leading-tight text-honey-gold-light sm:text-[30px]">{diagnosis.title}</h3>
              <p className="mb-7 text-[15.5px] leading-relaxed text-honey-text">{diagnosis.body}</p>
              <Link
                href={vslHref}
                onClick={() => trackEvent("ViewContent")}
                className="block w-full rounded-2xl bg-gradient-to-b from-honey-gold-light to-honey-gold px-5 py-4 text-center text-[15px] font-extrabold uppercase tracking-[0.04em] text-[#2a1a08] shadow-[0_16px_32px_-10px_rgba(227,166,62,0.55)]"
              >
                {text.result.cta}
              </Link>
              <p className="mt-3 text-center text-[12px] text-honey-text-faint">{text.result.ctaHint}</p>
              <p className="mt-6 text-center text-[11.5px] leading-relaxed text-honey-text-faint">{text.result.closing}</p>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
