"use client";

import type { NoteStyle } from "../types";
import {
  DownArrow,
  VisualShell,
  safeItems,
} from "./shared";

function isArrowOnly(value: string) {
  return /^(↓|↑|→|←|↔|->|-->|=>|→+|↓+|↑+|←+)$/.test(
    value.trim()
  );
}

function cleanNode(value: string) {
  return String(value || "")
    .trim()
    .replace(/^[-*•]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

export default function FlowchartBlock({
  title,
  items,
  style,
}: {
  title?: string;
  items?: string[];
  style: NoteStyle;
}) {
  const rawNodes = safeItems(items);

  if (!rawNodes.length) return null;

  const nodes = rawNodes
    .map(cleanNode)
    .filter(Boolean)
    .filter((item) => !isArrowOnly(item));

  if (!nodes.length) return null;

  return (
    <VisualShell title={title} label="Flow">
      <div
        className={[
          "kivraa-student-flow",
          style === "Colorful"
            ? "kivraa-student-flow-colorful"
            : "",
          style === "One Page"
            ? "kivraa-student-flow-compact"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {nodes.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="kivraa-flow-step"
          >
            <div className="kivraa-flow-step-inner">
              <span className="kivraa-flow-step-text">
                {item}
              </span>
            </div>

            {index < nodes.length - 1 ? (
              <div
                className="kivraa-flow-connector"
                aria-hidden="true"
              >
                <DownArrow />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </VisualShell>
  );
}