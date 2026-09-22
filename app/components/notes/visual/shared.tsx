import React from "react";

export const colorfulInk = [
  "blue",
  "purple",
  "red",
  "orange",
] as const;

export type InkColor = (typeof colorfulInk)[number];

/*
 * Existing visual blocks sometimes pass a number
 * and sometimes a string as the first argument.
 * Keep both compatible.
 */
export function nodeClass(
  index: number | string,
  colorful = true
) {
  if (!colorful) {
    return "kivraa-ink-blue";
  }

  const numericIndex =
    typeof index === "number"
      ? index
      : Math.abs(
          Array.from(index).reduce(
            (sum, char) => sum + char.charCodeAt(0),
            0
          )
        );

  return `kivraa-ink-${
    colorfulInk[numericIndex % colorfulInk.length]
  }`;
}

export function safeItems(
  items: unknown,
  limit = 8
): string[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .filter((item) => {
      const normalized = item
        .replace(/[→➡➜➝➞➔]/g, "")
        .trim();

      return (
        normalized.length > 0 &&
        normalized !== "-" &&
        normalized !== "—" &&
        normalized !== ">" &&
        normalized !== "→"
      );
    })
    .slice(0, limit);
}

/*
 * kind is optional because the existing visual blocks
 * already use VisualShell in both old and new forms.
 */
export function VisualShell({
  kind,
  label,
  title,
  children,
}: {
  kind?: string;
  label?: string;
  title?: string;
  children: React.ReactNode;
}) {
  const visualKind = kind || "student";

  return (
    <section
      className={`kivraa-visual kivraa-visual-${visualKind}`}
      data-visual-kind={visualKind}
    >
      {(label || title) && (
        <div className="kivraa-visual-heading">
          {label ? (
            <span className="kivraa-visual-label">
              {label}
            </span>
          ) : null}

          {title ? (
            <span className="kivraa-visual-title">
              {title}
            </span>
          ) : null}
        </div>
      )}

      <div className="kivraa-visual-content">
        {children}
      </div>
    </section>
  );
}

export function Arrow({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`kivraa-arrow ${className}`}
      aria-hidden="true"
    >
      →
    </span>
  );
}

export function DownArrow({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`kivraa-down-arrow ${className}`}
      aria-hidden="true"
    >
      ↓
    </span>
  );
}