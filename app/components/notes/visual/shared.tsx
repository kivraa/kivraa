import type { ReactNode } from "react";
import { asStringArray, type NoteStyle } from "../types";

const colorfulFills = [
  "bg-[#FFF3C0] border-[#F5B700]/40 text-[#1A1A1A]",
  "bg-[#DCEBFF] border-[#7FB3FF]/50 text-[#12305A]",
  "bg-[#DDF6E7] border-[#6BCF97]/45 text-[#14532D]",
  "bg-[#FFE0EC] border-[#F3A6C0]/45 text-[#7A2948]",
  "bg-[#FFF0C7] border-[#F5B700]/30 text-[#3F2E00]",
];

export function nodeClass(style: NoteStyle, index: number) {
  if (style === "Colorful") {
    return colorfulFills[index % colorfulFills.length];
  }
  return "bg-[#F7F8FA] border-black/[0.08] text-[#111827]";
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
    <div className="my-5 overflow-hidden rounded-[18px] border border-black/[0.08] bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-2.5">
        <span className="rounded-full bg-[#F5B700] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-black">
          {label}
        </span>
        {title ? (
          <h3 className="text-sm font-bold tracking-[-0.02em] text-[#111827]">
            {title}
          </h3>
        ) : null}
      </div>
      <div className="px-3 py-4 sm:px-5">{children}</div>
    </div>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
    >
      <path
        d="M5 12h12M13 6l6 6-6 6"
        stroke="#F5B700"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DownArrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 5v12M6 13l6 6 6-6"
        stroke="#F5B700"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function safeItems(items: unknown) {
  return asStringArray(items).slice(0, 10);
}
