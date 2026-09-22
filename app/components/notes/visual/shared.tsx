import type { ReactNode } from "react";
import { asStringArray, type NoteStyle } from "../types";

const colorfulInk = [
  "kivraa-ink-yellow",
  "kivraa-ink-blue",
  "kivraa-ink-green",
  "kivraa-ink-pink",
  "kivraa-ink-orange",
];

export function nodeClass(style: NoteStyle, index: number) {
  if (style === "Colorful") {
    return colorfulInk[index % colorfulInk.length];
  }

  return "kivraa-ink-neutral";
}

export function VisualShell({
  title,
  label,
  children,
}: {
  title?: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="kivraa-visual">
      <div className="kivraa-visual-heading">
        <span className="kivraa-visual-label">{label}</span>

        {title ? (
          <h3 className="kivraa-visual-title">
            {title}
          </h3>
        ) : null}
      </div>

      <div className="kivraa-visual-content">
        {children}
      </div>
    </section>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`kivraa-arrow ${className}`}
      fill="none"
    >
      <path
        d="M4 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DownArrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="kivraa-down-arrow"
      fill="none"
    >
      <path
        d="M12 4v14M7 13l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function safeItems(items: unknown) {
  return asStringArray(items)
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 10);
}