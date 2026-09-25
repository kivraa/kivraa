"use client";

import { useMemo, type Dispatch, SetStateAction } from "react";
import { buildNotebook, NotebookPageView } from "./NotePageContent";
import { prepareNotePage } from "./prepareNotePage";
import type { ClassLevel, NotePurpose, NoteStyle } from "./types";

/* ============================================================
   StudentNotebook - THE single shared Kivraa notebook renderer.

   Used by BOTH the desktop hero (Hero.tsx) and the mobile hero
   (MobileHero.tsx), so the notebook is identical on every screen.

   What it owns:
     - the physical sheet: cream paper, subtle blue ruling, a thin red
       left margin, a clean page edge and one restrained shadow,
     - content-driven pagination: the page count comes from how much
       study material the topic actually produced,
     - navigation: Previous / page indicators / Next, and nothing at all
       for One Page.

   What it never owns: the content. The renderer composes every page.

   Typography is Geist/system only. There is no Kalam, no cursive and no
   handwriting font anywhere in this component or in the renderer behind it.
   ============================================================ */

export default function StudentNotebook({
  topic,
  pages,
  currentPage,
  setCurrentPage,
  style,
  classLevel,
  purpose,
}: {
  topic: string;
  pages: string[];
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  style: NoteStyle;
  classLevel?: ClassLevel | null;
  purpose?: NotePurpose | null;
}) {
  const safePages = (Array.isArray(pages) ? pages : [])
    .map((page) => String(page ?? "").trim())
    .filter(Boolean);

  const isOnePage = style === "One Page";

  const source = useMemo(() => safePages.join("\n\n"), [safePages]);
  const cleaned = useMemo(() => prepareNotePage(source), [source]);

  /*
   * The generated pages are rejoined and handed to the renderer, which owns
   * the real page count. The shell simply navigates what the renderer built.
   */
  const notebook = useMemo(
    () =>
      buildNotebook({
        content: cleaned,
        topic,
        style,
        classLevel: classLevel ?? null,
        purpose: purpose ?? null,
      }),
    [cleaned, topic, style, classLevel, purpose]
  );

  const pageCount = notebook.pages.length;

  if (!pageCount) return null;

  const index = isOnePage
    ? 0
    : Math.min(Math.max(0, currentPage), pageCount - 1);

  const goTo = (next: number) =>
    setCurrentPage(Math.min(Math.max(0, next), pageCount - 1));

  const showNav = !isOnePage && pageCount > 1;

  return (
    <section
      id="generated-notes"
      className="relative border-t border-white/[0.05] bg-transparent px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[880px]">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F5B700]">
            Your Kivraa notes
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
              {style}
            </span>
            {showNav ? (
              <span className="rounded-full border border-white/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                {index + 1} / {pageCount}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative">
          {/* one restrained shadow, like a real page resting on a desk */}
          <div className="pointer-events-none absolute inset-x-8 bottom-[-10px] h-8 rounded-full bg-black/50 blur-2xl" />

          <article className="kv-sheet relative overflow-hidden rounded-[10px] border border-[#D9D0B2] bg-[#F8F4E6] shadow-[0_1px_2px_rgba(43,33,10,.12),0_12px_28px_rgba(0,0,0,.30)]">
            {/* thin coloured tab along the top edge */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#E8B44A]" />

            {/* subtle blue ruled lines */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.55]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, rgba(74,104,138,.13) 28px)",
              }}
            />

            {/* thin red left margin - desktop only, the narrow sheet has no gutter */}
            <div className="kv-margin-rule pointer-events-none absolute bottom-0 left-[38px] top-0 w-px bg-[#E08A8A]/45" />

            <div className="relative px-4 pb-5 pt-7 sm:pl-[62px] sm:pr-8">
              <div className="kv-sheet-page">
                <NotebookPageView
                  notebook={notebook}
                  pageIndex={index}
                  style={style}
                />
              </div>

              <div className="kv-sheet-foot">
                <span className="kv-sheet-foot-mark" aria-hidden="true">
                  {"\u2605"}
                </span>
                <span className="kv-sheet-foot-text">{topic}</span>
                <span className="kv-sheet-foot-page">
                  {index + 1}
                  {showNav ? ` / ${pageCount}` : ""}
                </span>
              </div>
            </div>
          </article>
        </div>

        {showNav ? (
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              className="min-h-11 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[12px] font-bold text-slate-400 transition hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F5B700] disabled:cursor-not-allowed disabled:opacity-25"
            >
              Previous
            </button>

            <div className="flex items-center gap-1.5">
              {notebook.pages.map((_, pageIndex) => (
                <button
                  key={pageIndex}
                  type="button"
                  onClick={() => goTo(pageIndex)}
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
              onClick={() => goTo(index + 1)}
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
