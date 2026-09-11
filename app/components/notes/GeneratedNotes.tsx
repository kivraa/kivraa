"use client";

import type { Dispatch, SetStateAction } from "react";
import NotePageContent from "./NotePageContent";
import type { NoteStyle } from "./types";

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
          <div className="pointer-events-none absolute inset-x-6 bottom-[-10px] h-8 rounded-full bg-black/50 blur-2xl" />

          <article
            className={[
              "relative overflow-hidden rounded-[22px] border border-black/[0.06] bg-white shadow-[0_24px_70px_rgba(0,0,0,.38)]",
              compact ? "min-h-[520px]" : "min-h-[640px]",
            ].join(" ")}
          >
            <div
              className={[
                "relative px-5 py-8 sm:px-10 sm:py-11",
                compact ? "sm:py-8" : "",
              ].join(" ")}
            >
              <div className="mb-7 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#F5B700] text-lg font-black text-black">
                  K
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Study notes
                  </div>
                  <div className="mt-1 text-[22px] font-black leading-tight tracking-[-0.03em] text-[#111827] sm:text-[26px]">
                    {topic}
                  </div>
                </div>
              </div>

            <div className="kivraa-note-page overflow-x-hidden break-words font-sans">
              <NotePageContent content={page} style={style} />
            </div>

              <div className="mt-8 flex items-center justify-between border-t border-black/[0.06] pt-4">
                <span className="text-[11px] font-medium text-slate-400">
                  Kivraa · understand · remember · revise
                </span>
                <span className="text-[11px] font-bold text-slate-400">
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
