import { NextResponse } from "next/server";
import { getOwnEntitlement, getRitualDays, getUser } from "@/lib/dal";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

/** LGPD/GDPR data portability: everything we store about the signed-in user, as JSON. */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [entitlement, days, consents] = await Promise.all([
    getOwnEntitlement(),
    getRitualDays(user.id),
    sql()<{ kind: string; version: string; granted: boolean; locale: string | null; created_at: Date }[]>`
      select kind, version, granted, locale, created_at from consents where user_id = ${user.id} order by created_at
    `,
  ]);

  const body = {
    exportedAt: new Date().toISOString(),
    user: {
      email: user.email,
      displayName: user.displayName,
      locale: user.locale,
      timezone: user.timezone,
      onboardedAt: user.onboardedAt,
      reminderOptIn: user.reminderOptIn,
    },
    purchase: entitlement,
    ritualDays: days,
    consents,
  };

  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="honey-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "cache-control": "no-store",
    },
  });
}
