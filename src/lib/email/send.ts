import "server-only";

import { Resend } from "resend";
import { serverEnv } from "@/lib/env";

let client: Resend | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(serverEnv.resendApiKey && (serverEnv.emailFrom || serverEnv.emailFromAddress));
}

/**
 * Builds the From header. `EMAIL_FROM` wins when set and is used verbatim.
 * Otherwise `EMAIL_FROM_ADDRESS` is combined with the sender name, which
 * callers pass as the brand for the recipient's language — a Brazilian buyer
 * should not get mail signed with the English brand.
 */
function fromHeader(senderName?: string): string {
  if (serverEnv.emailFrom) return serverEnv.emailFrom;
  const address = serverEnv.emailFromAddress;
  if (!senderName) return address;
  // Quote the display name so punctuation in a brand can't break the header.
  return `"${senderName.replace(/["\\]/g, "")}" <${address}>`;
}

/**
 * Sends a transactional e-mail through Resend. When Resend isn't configured
 * outside production, the message is printed to the server console so the
 * magic-link flow can still be exercised locally.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  senderName?: string;
}): Promise<void> {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[email:dev] to=${input.to}\nsubject=${input.subject}\n${input.text}\n`);
      return;
    }
    throw new Error("E-mail is not configured (RESEND_API_KEY and EMAIL_FROM or EMAIL_FROM_ADDRESS).");
  }
  if (!client) client = new Resend(serverEnv.resendApiKey);
  const { error } = await client.emails.send({
    from: fromHeader(input.senderName),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}
