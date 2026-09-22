/** Local calendar date as YYYY-MM-DD (not UTC — follows the device timezone). */
export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isValidDateKey(key: unknown): key is string {
  return typeof key === "string" && /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(Date.parse(key));
}

export function isYesterday(key: string | null): boolean {
  if (!key) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return key === dateKey(yesterday);
}

export function isToday(key: string | null): boolean {
  return key === dateKey();
}
