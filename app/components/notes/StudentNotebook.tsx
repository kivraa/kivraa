"use client";

import { useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import NotePageContent from "./NotePageContent";
import { prepareNotePage } from "./prepareNotePage";
import { prepareOnePage } from "./kivraa";
import type { NoteStyle } from "./types";
import { KivraaLogoStatic } from "../KivraaLogo";

/* ============================================================
   StudentNotebook — THE single shared Kivraa notebook renderer.

   Used by BOTH the desktop hero (Hero.tsx) and the mobile hero
   (MobileHero.tsx). It is the ONE place where a generated note is
   painted, so the notebook always looks identical everywhere:

     • ONE fixed sheet, identical size on desktop and mobile.
     • No sliding rail — only the active page is shown, and navigating
       swaps the sheet in place (prev / next + page dots).
     • "One Page" is a single fixed sheet with no navigation at all.
     • Geist sans only — no Kalam, no handwritten/cursive fonts. The
       entire Kalam stack was removed from the app, so this renderer
       carries no `hand` / `var(--font-kivraa-hand)` anywhere.

   The sheet itself is intentionally viewport-agnostic: identical
   padding, identical font stack, identical page container on every
   screen. Only the outer card width adapts so the paper never feels
   cramped on a phone.
   ============================================================ */

export default function StudentNotebook({
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
  const safePages = (Array.isArray(pages) ? pages : [])
    .map((p) => String(p ?? "").trim())
    .filter(Boolean);

  if (!safePages.length) return null;

  const pageCount = safePages.length;
  const isOnePage = style === "One Page";

  /* One Page renders every generated page merged into a single fixed sheet. */
  const [current, setCurrent] = useState(currentPage);
  const index = isOnePage
    ? 0
    : Math.min(Math.max(0, current), pageCount - 1 , 0);
  const page = safePages[index];

  const content = isOnePage
    ? prepareOnePage(safePages.join("\n\n"))
    : prepareNotePage(page);

  return (
    <section
      id="generated-notes"
      className="relative border-t border-white/[0.05] bg-transparent px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[860px]">
        {/* header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
            {!isOnePage && pageCount > 1 ? (
              <span className="rounded-full border border-white/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                {index + 1} / {pageCount}
              </span>
            ) : null}
          </div>
        </div>

        {/* ONE FIXED SHEET — identical on desktop and mobile */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-6 bottom-[-12px] h-10 rounded-full bg-black/60 blur-2xl" />

          <article className="relative overflow-hidden rounded-[26px] border border-[#D8CFAE] bg-[#F8F1DE] shadow-[0_1px_2px_rgba(43,33,10,.14),0_10px_30px_rgba(0,0,0,.32),0_34px_80px_rgba(0,0,0,.5)]">
            {/* paper top edge */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[#F5B700]" />

            {/* faint notebook ruling */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.4]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 35px, rgba(70,90,110,.09) 36px)",
              }}
            />

            {/* red margin line */}
            <div className="pointer-events-none absolute bottom-0 left-[46px] top-0 w-px bg-red-300/40" />

            <div className="relative px-6 pb-8 pt-9 sm:pl-[74px] sm:pr-12 sm:pt-10">
              {/* header */}
              <div className="mb-6 flex items-start gap-3">
                <KivraaLogoStatic className="shrink-0 -rotate-2" size={40} />
                <div className="min-w-0">
                  <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#9C8C57]">
                    study note
                  </div>
                  <div className="mt-1 text-[26px] font-bold leading-[1.05] tracking-[-0.01em] text-[#142C49] sm:text-[28px]">
                    {topic}
                  </div>
                  <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#9B927D]">
                    learn it · connect it · remember it
                  </div>
                </div>
              </div>

              <div className="kivraa-note-page overflow-x-hidden break-words">
                <NotePageContent content={content} style={style} />
              </div>

              <div className="mt-8 flex items-end justify-between border-t border-dashed border-[#D7CEB3] pt-3">
                <span className="text-[12px] italic text-[#9D947D]">
                  Kivraa · make the idea click
                </span>
                <span className="text-[12px] font-bold text-[#9D947D]">
                  {index + 1}
                  {!isOnePage && pageCount > 1 ? ` / ${pageCount}` : ""}
                </span>
              </div>
            </div>
          </article>
        </div>

        {/* prev / next + dots — only when there is more than one page */}
        {!isOnePage && pageCount > 1 ? (
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrent((p) => Math.max(0, p - 1))}
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
                  onClick={() => setCurrent(pageIndex)}
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
                setCurrent((p) => Math.min(pageCount - 1, p + 1))
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
