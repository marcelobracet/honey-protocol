import type { ReactNode } from "react";

/**
 * Replaces `{key}` placeholders in a translated string with React nodes
 * (links, bold text…). Unknown keys are left as-is.
 */
export function Interpolate({ template, values }: { template: string; values: Record<string, ReactNode> }) {
  const parts = template.split(/(\{\w+\})/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = /^\{(\w+)\}$/.exec(part);
        if (match && match[1] in values) return <span key={i}>{values[match[1]]}</span>;
        return part;
      })}
    </>
  );
}
