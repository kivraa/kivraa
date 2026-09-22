"use client";

import type { NoteStyle } from "../types";
import { Arrow, VisualShell, nodeClass, safeItems } from "./shared";

export default function CycleBlock({
  title,
  items,
  style,
}: {
  title?: string;
  items?: string[];
  style: NoteStyle;
}) {
  const nodes = safeItems(items);

  if (!nodes.length) return null;

  return (
    <VisualShell title={title} label="Cycle">
      <div
        className={[
          "kivraa-student-cycle",
          style === "Colorful"
            ? "kivraa-student-cycle-colorful"
            : "kivraa-student-cycle-simple",
        ].join(" ")}
      >
        {/* Desktop / tablet circular study diagram */}
        <div className="kivraa-cycle-desktop">
          <div className="kivraa-cycle-ring" aria-hidden="true" />

          <div className="kivraa-cycle-center">
            <span>cycle</span>
          </div>

          {nodes.map((item, index) => {
            const angle =
              (index / nodes.length) * Math.PI * 2 - Math.PI / 2;

            const radius = nodes.length > 5 ? 108 : 96;

            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <div
                key={`${item}-${index}`}
                className={[
                  "kivraa-cycle-node",
                  nodeClass(style, index),
                ].join(" ")}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                }}
              >
                <span>{item}</span>
              </div>
            );
          })}

          <svg
            className="kivraa-cycle-arrow-ring"
            viewBox="0 0 300 300"
            aria-hidden="true"
          >
            <path
              d="M150 37
                 C214 37 263 87 263 150
                 C263 213 213 263 150 263
                 C87 263 37 213 37 150
                 C37 87 87 37 150 37"
            />

            <path
              className="kivraa-cycle-arrow-head"
              d="M144 31 L159 38 L147 49"
            />
          </svg>
        </div>

        {/* Mobile — same concept, vertical notebook flow */}
        <div className="kivraa-cycle-mobile">
          {nodes.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="kivraa-cycle-mobile-step"
            >
              <div
                className={[
                  "kivraa-cycle-mobile-node",
                  nodeClass(style, index),
                ].join(" ")}
              >
                <span>{item}</span>
              </div>

              {index < nodes.length - 1 ? (
                <div className="kivraa-cycle-mobile-arrow">
                  <Arrow />
                </div>
              ) : (
                <div className="kivraa-cycle-return">
                  ↻ back to start
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </VisualShell>
  );
}