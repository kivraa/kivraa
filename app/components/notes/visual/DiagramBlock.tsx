"use client";

import type { NoteStyle } from "../types";
import { VisualShell, nodeClass, safeItems } from "./shared";

export default function DiagramBlock({
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
    <VisualShell title={title} label="Diagram">
      <div className="relative mx-auto max-w-[640px]">
        <div className="pointer-events-none absolute bottom-3 left-[18px] top-3 w-px bg-[#F5B700]/50 sm:left-[22px]" />

        <div className="space-y-2.5">
          {nodes.map((item, index) => (
            <div key={`${item}-${index}`} className="flex items-center gap-3">
              <div className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F5B700]/40 bg-[#F5B700] text-[11px] font-black text-black">
                {index + 1}
              </div>
              <div
                className={[
                  "min-h-[44px] flex-1 rounded-[14px] border px-3 py-2.5 text-[13px] font-bold leading-5",
                  nodeClass(style, index),
                ].join(" ")}
              >
                {item}
              </div>
            </div>
          ))}
        </div>
      </div>
    </VisualShell>
  );
}
