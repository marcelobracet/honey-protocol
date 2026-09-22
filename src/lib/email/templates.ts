import "server-only";

import type { Dictionary } from "@/i18n/types";
import { publicEnv } from "@/lib/env";

interface Rendered {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function layout(input: { brand: string; title: string; body: string; cta?: { label: string; href: string }; note?: string; footer: string }): string {
  const cta = input.cta
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto"><tr><td style="border-radius:14px;background:#e3a63e"><a href="${input.cta.href}" style="display:inline-block;padding:15px 28px;font:700 16px/1 Arial,sans-serif;color:#2a1a08;text-decoration:none">${escapeHtml(input.cta.label)}</a></td></tr></table>`
    : "";
  const note = input.note ? `<p style="margin:0 0 18px;font:14px/1.6 Arial,sans-serif;color:#8a745a">${escapeHtml(input.note)}</p>` : "";
  return `<!doctype html><html><body style="margin:0;background:#241609;padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#2f1d0f;border:1px solid rgba(246,234,210,0.12);border-radius:22px;padding:32px 28px;text-align:center">
<tr><td>
<p style="margin:0 0 18px;font:italic 600 18px Georgia,serif;color:#f6cf7c">${escapeHtml(input.brand)}</p>
<h1 style="margin:0 0 14px;font:600 24px/1.25 Georgia,serif;color:#f6ead2">${escapeHtml(input.title)}</h1>
<p style="margin:0 0 6px;font:16px/1.6 Arial,sans-serif;color:#c7ab84">${escapeHtml(input.body)}</p>
${cta}
${note}
<p style="margin:0;font:12px/1.6 Arial,sans-serif;color:#8a745a">${escapeHtml(input.footer)}</p>
</td></tr></table></td></tr></table></body></html>`;
}

export function renderWelcomeEmail(dict: Dictionary, link: string): Rendered {
  const t = dict.email.welcome;
  return {
    subject: t.subject,
    html: layout({ brand: dict.common.brand, title: t.title, body: t.body, cta: { label: t.cta, href: link }, note: t.expires, footer: t.footer }),
    text: `${t.title}\n\n${t.body}\n\n${t.cta}: ${link}\n\n${t.expires}\n\n${t.footer}`,
  };
}

export function renderLoginEmail(dict: Dictionary, link: string): Rendered {
  const t = dict.email.login;
  return {
    subject: t.subject,
    html: layout({ brand: dict.common.brand, title: t.title, body: t.body, cta: { label: t.cta, href: link }, note: t.expires, footer: t.footer }),
    text: `${t.title}\n\n${t.body}\n\n${t.cta}: ${link}\n\n${t.expires}\n\n${t.footer}`,
  };
}

/** Onboarding sequence step (day N after purchase). */
export function renderSequenceEmail(dict: Dictionary, locale: string, step: Dictionary["email"]["sequence"][number]): Rendered {
  const link = `${publicEnv.siteUrl}/${locale}/app`;
  return {
    subject: step.subject,
    html: layout({ brand: dict.common.brand, title: step.title, body: step.body, cta: { label: step.cta, href: link }, footer: dict.email.sequenceFooter }),
    text: `${step.title}\n\n${step.body}\n\n${step.cta}: ${link}\n\n${dict.email.sequenceFooter}`,
  };
}

export function renderReminderEmail(dict: Dictionary, locale: string): Rendered {
  const t = dict.email.reminder;
  const link = `${publicEnv.siteUrl}/${locale}/app`;
  return {
    subject: t.subject,
    html: layout({ brand: dict.common.brand, title: t.title, body: t.body, cta: { label: t.cta, href: link }, footer: t.footer }),
    text: `${t.title}\n\n${t.body}\n\n${t.cta}: ${link}\n\n${t.footer}`,
  };
}
