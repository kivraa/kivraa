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

  const radius = nodes.length > 5 ? 118 : 102;

  return (
    <VisualShell title={title} label="Cycle">
      <div className="mk-cycle mx-auto hidden h-[280px] w-full max-w-[420px] sm:block">
        <div className="relative h-full w-full">
          <div className="absolute left-1/2 top-1/2 h-[168px] w-[168px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#F5B700]/45" />
          <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F5B700] text-[10px] font-black uppercase tracking-[0.12em] text-black">
            Cycle
          </div>
          {nodes.map((item, index) => {
            const angle = (index / nodes.length) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <div
                key={`${item}-${index}`}
                className={[
                  "absolute max-w-[120px] rounded-[14px] border px-2.5 py-2 text-center text-[11px] font-bold leading-4 shadow-sm",
                  nodeClass(style, index),
                ].join(" ")}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mk-cycle-list flex flex-col items-center gap-2 sm:hidden">
        {nodes.map((item, index) => (
          <div key={`${item}-${index}`} className="flex w-full flex-col items-center">
            <div
              className={[
                "w-full rounded-[14px] border px-3 py-3 text-center text-[13px] font-bold",
                nodeClass(style, index),
              ].join(" ")}
            >
              {item}
            </div>
            {index < nodes.length - 1 ? (
              <div className="flex h-6 rotate-90 items-center">
                <Arrow className="h-5 w-5" />
              </div>
            ) : (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#B45309]">
                returns to start
              </p>
            )}
          </div>
        ))}
      </div>
    </VisualShell>
  );
}
