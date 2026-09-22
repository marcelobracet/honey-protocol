"use server";

import { headers } from "next/headers";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { sql } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { LEGAL_VERSION } from "@/lib/legal";
import { isQuizSegment, sanitizeAnswers, segmentFor } from "@/lib/quiz";

export type SaveLeadResult = { status: "ok" } | { status: "error"; code: "invalid" | "generic" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Stores a quiz lead. The e-mail is optional by design: under the LGPD consent
 * must be freely given, and gating the result behind it would undermine that.
 * Answers are kept for segmentation and are validated against the quiz itself,
 * so only known ids and values are ever written.
 */
export async function saveQuizLead(input: {
  locale: string;
  answers: unknown;
  email?: string | null;
  consented: boolean;
}): Promise<SaveLeadResult> {
  if (!isLocale(input.locale)) return { status: "error", code: "invalid" };
  if (!isDatabaseConfigured()) return { status: "error", code: "generic" };

  const dict = await getDictionary(input.locale);
  const answers = sanitizeAnswers(input.answers, dict.quiz.questions);
  if (Object.keys(answers).length === 0) return { status: "error", code: "invalid" };

  const segment = segmentFor(answers);
  if (!isQuizSegment(segment)) return { status: "error", code: "generic" };

  const email = input.email?.trim().toLowerCase() ?? "";
  const hasEmail = email.length > 0;
  if (hasEmail && (!EMAIL_RE.test(email) || email.length > 254)) {
    return { status: "error", code: "invalid" };
  }
  // An address is only stored together with permission to write to it.
  const consented = hasEmail && input.consented === true;
  if (hasEmail && !consented) return { status: "error", code: "invalid" };

  try {
    const ua = (await headers()).get("user-agent")?.slice(0, 300) ?? null;
    await sql().begin(async (tx) => {
      await tx`
        insert into quiz_leads (email, locale, segment, answers, consented, user_agent)
        values (${hasEmail ? email : null}, ${input.locale}, ${segment}, ${tx.json(answers as never)}, ${consented}, ${ua})
        on conflict (email) where email is not null do update set
          locale = excluded.locale,
          segment = excluded.segment,
          answers = excluded.answers,
          consented = excluded.consented
      `;
      if (consented) {
        await tx`
          insert into consents (email, kind, version, granted, locale, user_agent)
          values (${email}, 'quiz_marketing', ${LEGAL_VERSION}, true, ${input.locale}, ${ua})
        `;
      }
    });
    return { status: "ok" };
  } catch (err) {
    console.error("[quiz] failed to save lead", err);
    // Never block the result over a storage problem — the visitor came for it.
    return { status: "error", code: "generic" };
  }
}
