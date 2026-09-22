"use client";

import type { NoteStyle } from "../types";
import {
  DownArrow,
  VisualShell,
  nodeClass,
  safeItems,
} from "./shared";

export default function FlowchartBlock({
  title,
  items,
  style,
}: {
  title?: string;
  items?: string[];
  style: NoteStyle;
}) {
  const steps = safeItems(items, 8);

  if (!steps.length) return null;

  const colorful = style === "Colorful";

  return (
    <VisualShell title={title} label="Flow">
      <div
        className={[
          "kivraa-student-flow",
          colorful
            ? "kivraa-student-flow-colorful"
            : "kivraa-student-flow-simple",
        ].join(" ")}
      >
        {steps.map((step, index) => (
          <div
            key={`${step}-${index}`}
            className="kivraa-flow-step-group"
          >
            <div
              className={[
                "kivraa-flow-step",
                nodeClass(index, colorful),
              ].join(" ")}
            >
              <span className="kivraa-flow-step-mark">
                {index + 1}
              </span>

              <span className="kivraa-flow-step-text">
                {step}
              </span>
            </div>

            {index < steps.length - 1 ? (
              <div className="kivraa-flow-connector">
                <DownArrow />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </VisualShell>
  );
}