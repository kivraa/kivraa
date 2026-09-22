"use client";

import type { NoteStyle } from "../types";
import {
  VisualShell,
  nodeClass,
  safeItems,
} from "./shared";

function splitLabel(value: string) {
  const match = value.match(
    /^(.+?)\s*(?:→|➡|➜|:|-)\s*(.+)$/
  );

  if (!match) {
    return {
      label: value.trim(),
      description: "",
    };
  }

  return {
    label: match[1].trim(),
    description: match[2].trim(),
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
  const values = safeItems(items, 6);

  if (!values.length) return null;

  const colorful = style === "Colorful";

  const center = values[0];

  const labels = values.slice(1, 5);

  return (
    <VisualShell title={title} label="Diagram">
      <div
        className={[
          "kivraa-student-diagram",
          colorful
            ? "kivraa-student-diagram-colorful"
            : "kivraa-student-diagram-simple",
        ].join(" ")}
      >
        <div className="kivraa-diagram-paper">
          <div
            className={[
              "kivraa-diagram-center",
              nodeClass(0, colorful),
            ].join(" ")}
          >
            <span className="kivraa-diagram-center-text">
              {center}
            </span>
          </div>

          {labels.map((item, index) => {
            const parsed = splitLabel(item);

            return (
              <div
                key={`${item}-${index}`}
                className={[
                  "kivraa-diagram-label",
                  `kivraa-diagram-label-${index}`,
                  nodeClass(index + 1, colorful),
                ].join(" ")}
              >
                <span className="kivraa-diagram-line" />

                <div className="kivraa-diagram-label-text">
                  <strong>{parsed.label}</strong>

                  {parsed.description ? (
                    <small>
                      {parsed.description}
                    </small>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VisualShell>
  );
}