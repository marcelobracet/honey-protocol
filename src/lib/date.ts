export function dateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
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
