"use client";

import type { NoteStyle } from "../types";
import { VisualShell, safeItems } from "./shared";

function cleanItem(value: string) {
  return String(value || "")
    .trim()
    .replace(/^[-*•]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

function splitLabel(value: string) {
  const cleaned = cleanItem(value);

  const separators = [
    "→",
    "->",
    ":",
    "—",
    "-",
  ];

  for (const separator of separators) {
    if (!cleaned.includes(separator)) continue;

    const parts = cleaned
      .split(separator)
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      return {
        label: parts[0],
        description: parts.slice(1).join(" "),
      };
    }
  }

  return {
    label: cleaned,
    description: "",
  };
}

export default function DiagramBlock({
  title,
  items,
  style,
}: {
  title?: string;
  items?: string[];
  style: NoteStyle;
}) {
  const nodes = safeItems(items)
    .map(cleanItem)
    .filter(Boolean);

  if (!nodes.length) return null;

  /*
   * A diagram should look like something a student
   * actually sketched in their notebook.
   *
   * It is intentionally NOT:
   * - numbered cards
   * - dashboard UI
   * - yellow boxes
   * - perfectly symmetrical cards
   */

  const center =
    nodes.length > 2
      ? nodes[Math.floor(nodes.length / 2)]
      : nodes[0];

  const surrounding =
    nodes.length > 2
      ? nodes.filter(
          (_, index) =>
            index !== Math.floor(nodes.length / 2)
        )
      : nodes.slice(1);

  return (
    <VisualShell
      title={title}
      label="Sketch"
    >
      <div
        className={[
          "kivraa-student-diagram",
          style === "Colorful"
            ? "kivraa-student-diagram-colorful"
            : "",
          style === "One Page"
            ? "kivraa-student-diagram-compact"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="kivraa-diagram-paper">
          <div className="kivraa-diagram-center">
            <span className="kivraa-diagram-center-text">
              {center}
            </span>
          </div>

          {surrounding.map((item, index) => {
            const parsed = splitLabel(item);

            return (
              <div
                key={`${item}-${index}`}
                className={`kivraa-diagram-label kivraa-diagram-label-${index % 4}`}
              >
                <span className="kivraa-diagram-line" />

                <span className="kivraa-diagram-label-text">
                  {parsed.label}

                  {parsed.description ? (
                    <small>
                      {parsed.description}
                    </small>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </VisualShell>
  );
}