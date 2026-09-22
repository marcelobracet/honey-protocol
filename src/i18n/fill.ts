/**
 * Replaces `{name}` placeholders in a translated string.
 *
 * Deliberately kept apart from `get-dictionary`, which is server-only:
 * client components interpolate translated text too, and importing it from
 * there would drag the server guard into the browser bundle.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => (key in values ? String(values[key]) : `{${key}}`));
}
