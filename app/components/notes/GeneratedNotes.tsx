"use client";

import type { Dispatch, SetStateAction } from "react";
import NotePageContent from "./NotePageContent";
import type { NoteStyle } from "./types";
import { KivraaLogoStatic } from "../KivraaLogo";

export default function GeneratedNotes({
  topic,
  pages,
  currentPage,
  setCurrentPage,
  style,
}: {
  topic: string;
  pages: string[];
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  style: NoteStyle;
}) {
  const safePages = Array.isArray(pages) ? pages.filter(Boolean) : [];
  if (!safePages.length) return null;

  const pageCount = safePages.length;
  const index = Math.min(Math.max(0, currentPage), pageCount - 1);
  const page = safePages[index] || "";
  const compact = style === "One Page";

  return (
    <section
      id="generated-notes"
      className="relative border-t border-white/[0.05] bg-[#09090B] px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[860px]">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F5B700]">
              Your Kivraa notes
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
              {topic}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
              {style}
            </span>
            {pageCount > 1 ? (
              <span className="rounded-full border border-white/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                {index + 1} / {pageCount}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-x-6 bottom-[-10px] h-8 rounded-full bg-black/60 blur-2xl" />

          <article
            className={[
              "mk-desktop-paper relative overflow-hidden border border-[#D8CFAE] bg-[#F8F1DE] shadow-[0_1px_2px_rgba(43,33,10,.14),0_10px_30px_rgba(0,0,0,.32),0_34px_80px_rgba(0,0,0,.5)]",
              compact ? "min-h-[520px]" : "min-h-[640px]",
            ].join(" ")}
          >
            {/* paper top edge */}
            <div className="absolute left-0 right-0 top-0 h-1.5 bg-[#F5B700]" />

            {/* paper grain — pure CSS noise */}
            <div aria-hidden="true" className="mk-paper-grain pointer-events-none absolute inset-0" />

            {/* faint notebook ruling */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.4]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 35px, rgba(70,90,110,.09) 36px)",
              }}
            />

            {/* red margin line */}
            <div className="pointer-events-none absolute bottom-0 left-[46px] top-0 w-px bg-red-300/40" />

            <div
              className={[
                "relative pl-[58px] pr-10 pt-10",
                compact ? "sm:py-7" : "sm:py-10",
              ].join(" ")}
            >
              {/* handwritten note header */}
              <div className="mb-6 flex items-start gap-3">
                <KivraaLogoStatic
                  className="shrink-0 -rotate-2"
                  size={40}
                />
                <div className="min-w-0">
                  <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#9C8C57]">
                    study note
                  </div>
                  <div
                    className="mt-1 text-[28px] font-bold leading-[1.05] tracking-[-0.01em] text-[#142C49] sm:text-[30px]"
                    style={{ fontFamily: "var(--font-kivraa-hand)" }}
                  >
                    {topic}
                  </div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#9B927D]">
                    learn it · connect it · remember it
                  </div>
                </div>
              </div>

              <div className="kivraa-note-page overflow-x-hidden break-words">
                <NotePageContent content={page} style={style} />
              </div>

              <div className="mt-9 flex items-end justify-between border-t border-dashed border-[#D7CEB3] pt-3">
                <span className="text-[12px] italic text-[#9D947D]">
                  Kivraa · make the idea click
                </span>
                <span className="text-[12px] font-bold text-[#9D947D]">
                  {index + 1}
                  {pageCount > 1 ? ` / ${pageCount}` : ""}
                </span>
              </div>
            </div>
          </article>
        </div>

        {pageCount > 1 ? (
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={index === 0}
              className="min-h-11 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[12px] font-bold text-slate-400 transition hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F5B700] disabled:cursor-not-allowed disabled:opacity-25"
            >
              Previous
            </button>

            <div className="flex items-center gap-1.5">
              {safePages.map((_, pageIndex) => (
                <button
                  key={pageIndex}
                  type="button"
                  onClick={() => setCurrentPage(pageIndex)}
                  aria-label={`Page ${pageIndex + 1}`}
                  aria-current={index === pageIndex ? "page" : undefined}
                  className={[
                    "h-2 min-h-[8px] rounded-full transition-all",
                    index === pageIndex
                      ? "w-8 bg-[#F5B700]"
                      : "w-2 bg-white/[0.14] hover:bg-white/[0.3]",
                  ].join(" ")}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((p) => Math.min(pageCount - 1, p + 1))
              }
              disabled={index === pageCount - 1}
              className="min-h-11 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[12px] font-bold text-slate-400 transition hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F5B700] disabled:cursor-not-allowed disabled:opacity-25"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}