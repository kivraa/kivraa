"use client";

import { useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { asStringArray, type VisualKind } from "../notes/types";
import VisualBlock from "../notes/VisualBlock";
import ComparisonTable from "../notes/visual/ComparisonTable";
import { prepareNotePage } from "../notes/prepareNotePage";
import { prepareOnePage } from "../notes/kivraa";
import { KivraaLogoStatic } from "../KivraaLogo";
import { readableVisualText, visualItems, type Style } from "../notes/kivraa";

const hand = "var(--font-kivraa-hand)";

/* Gap, in px, between notebook columns. Must match the CSS below and the
   walk-from-column-to-column math. */
const COLUMN_GAP = 56;

const makeNoteComponents = (style: Style) => ({
  h1: ({ children }: { children?: React.ReactNode }) => (
    <div className="relative mb-3 mt-0.5 inline-block max-w-full min-w-0 break-words">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[-2px] top-[58%] bottom-[3%] -z-[1] rotate-[-0.5deg] rounded-[3px] bg-[#F5D85B]/75"
      />
      <h1
        className="text-[22px] font-bold leading-[1.12] text-[#142C49]"
        style={{ fontFamily: hand }}
      >
        {children}
      </h1>
    </div>
  ),

  h2: ({ children }: { children?: React.ReactNode }) => (
    <div className="mb-2 mt-4">
      <div className="flex items-end gap-2">
        <span className="mb-[3px] h-2 w-2 shrink-0 rounded-full bg-[#F5B700]" />
        <h2
          className="text-[19px] font-bold leading-tight text-[#142C49]"
          style={{ fontFamily: hand }}
        >
          {children}
        </h2>
      </div>
      <div className="mt-1.5 h-[3px] w-12 rounded-full bg-[#F5B700]" />
    </div>
  ),

  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3
      className="mb-1 mt-3 text-[16.5px] font-bold text-[#17314F]"
      style={{ fontFamily: hand }}
    >
      {children}
    </h3>
  ),

  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-2 text-[16.5px] font-medium leading-[1.6] text-[#26384B]">
      {children}
    </p>
  ),

  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3 ml-5 list-disc space-y-0.5 text-[16px] leading-[1.65] text-[#26384B] marker:text-[#E7A900]">
      {children}
    </ul>
  ),

  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-3 ml-5 list-decimal space-y-0.5 text-[16px] leading-[1.65] text-[#26384B] marker:font-bold marker:text-[#E7A900]">
      {children}
    </ol>
  ),

  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="pl-1">{children}</li>
  ),

  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong
      className="rounded-[3px] bg-[#FFE875] px-1 font-bold text-[#132C4B]"
      style={{ fontFamily: hand }}
    >
      {children}
    </strong>
  ),

  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="font-medium text-[#555]">{children}</em>
  ),

  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="relative my-3 rounded-[15px] border border-[#E8C84C] bg-[#FFF0A8]/75 px-3.5 py-2 shadow-[2px_3px_0_rgba(0,0,0,.06)]">
      <div
        className="mb-0.5 text-[12px] font-bold text-[#A27600]"
        style={{ fontFamily: hand }}
      >
        💡 Think of it like this
      </div>
      <div className="text-[15.5px] font-medium leading-[1.55] text-[#26384B]">
        {children}
      </div>
    </blockquote>
  ),

  code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
    const lang = /language-([a-z0-9-]+)/i
      .exec(className || "")?.[1]
      ?.toLowerCase();
    const text = String(children ?? "")
      .replace(/\n$/, "")
      .trim();
    const visualKinds = [
      "flowchart",
      "diagram",
      "cycle",
      "formula",
      "important",
      "remember",
      "example",
    ];

    if (lang === "comparison") {
      const rows = text
        .split("\n")
        .map((row) => row.trim())
        .filter(Boolean);

      if (!rows.length) return null;

      return <ComparisonTable rows={rows} />;
    }

    if (lang && visualKinds.includes(lang)) {
      const lines = asStringArray(text.split("\n"));
      let title: string | undefined;
      const rawItems: string[] = [];

      for (const line of lines) {
        const titleMatch = line.match(/^title\s*:\s*(.+)$/i);
        if (titleMatch && !title) {
          title = readableVisualText(titleMatch[1].trim());
        } else {
          rawItems.push(line);
        }
      }

      const items = visualItems(lang, rawItems);

      if (!items.length && !title) return null;

      return (
        <VisualBlock
          kind={lang as VisualKind}
          title={title}
          items={items}
          style={style}
        />
      );
    }

    if (text.includes("$") && /\$[^$]+\$/.test(text)) {
      return (
        <span className="inline-block max-w-full align-baseline text-[15px] font-medium text-[#26384B]">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {text}
          </ReactMarkdown>
        </span>
      );
    }

    return (
      <code className="break-all rounded-md bg-[#E9E1C8] px-1.5 py-0.5 font-mono text-[13px] text-[#17314F]">
        {children}
      </code>
    );
  },

  hr: () => (
    <div className="my-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-[#D7CEB3]" />
      <span className="text-[#D1A900]">✦</span>
      <div className="h-px flex-1 bg-[#D7CEB3]" />
    </div>
  ),

  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-3 overflow-x-auto rounded-[13px] border border-[#DDD2AE] bg-white/45">
      <table className="mk-table w-full min-w-[300px] border-collapse text-[13.5px]">
        {children}
      </table>
    </div>
  ),

  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border-b border-[#DDD2AE] bg-[#F5D85B]/50 px-3 py-2.5 text-left font-bold text-[#172D48]">
      {children}
    </th>
  ),

  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border-b border-[#E6DEC7] px-3 py-2.5 text-[#26384B]">
      {children}
    </td>
  ),

  img: ({ src, alt }: { src?: string | Blob; alt?: string }) => (
    <div className="my-3 overflow-hidden rounded-[16px] border border-[#D8CFAE] bg-white/40 p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || ""}
        alt={alt || "Diagram"}
        className="mx-auto max-h-[320px] max-w-full object-contain"
      />
    </div>
  ),
});

export default function MobileGeneratedNotes({
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
  style: Style;
}) {
  const [sheetScale, setSheetScale] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);
  const [columnCount, setColumnCount] = useState(1);
  const [dense, setDense] = useState(0);
  const denseRef = useRef(0);
  const prevPagesRef = useRef(pages);
  const pagesRef = useRef<HTMLDivElement>(null);
  const isOnePage = pages.length === 1;

  /* One Page: the revision sheet must fit exactly one fixed sheet — if it
     still overflows after compaction, gently squeeze it vertically so no
     content is ever clipped. */
  useLayoutEffect(() => {
    if (!isOnePage || !pages.length) return;

    let alive = true;
    setSheetScale(1);

    const timer = window.setTimeout(async () => {
      try {
        await (document as Document & { fonts: FontFaceSet }).fonts.ready;
      } catch {
        /* fine */
      }
      if (!alive) return;

      const bodyEl = document.querySelector(
        "#generated-notes .mk-note-body"
      ) as HTMLElement | null;
      if (!bodyEl) return;

      const available = bodyEl.clientHeight;
      const content = bodyEl.scrollHeight;

      if (content > available) {
        const scale = Math.max(0.42, available / content);
        if (alive) setSheetScale(Math.round(scale * 1000) / 1000);
      }
    }, 80);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [isOnePage, pages]);

/* Multi-page notes are packed by the browser's own column layout: the
     whole markdown stream flows into fixed-height columns (one per phone
     sheet), so content can never be clipped — whatever does not fit spills
     into the next column (= next page). Pagination just slides the stream.
     The column count is read straight from layout (synchronously, then on
     every change) so the digit on the pill always matches the paper. */
  useLayoutEffect(() => {
    if (!pages.length || isOnePage) return;

    const bodyEl = document.querySelector(
      "#generated-notes .mk-note-body"
    ) as HTMLElement | null;
    const wrap = pagesRef.current;
    if (!bodyEl || !wrap) return;

    if (prevPagesRef.current !== pages) {
      prevPagesRef.current = pages;
      denseRef.current = 0;
      setDense(0);
    }
    let interrupted = false;
    let lastCount = -1;

    const measure = () => {
      if (interrupted) return;

      const width = bodyEl.clientWidth;
      if (width > 0) setPageWidth(width);

      /* An indivisible visual block (chart, study card, formula sheet…) that
         is taller than one sheet would spill below the paper — columns cannot
         break it. Shrink those blocks (uniform scale) so every sheet fits. */
      const pageH = bodyEl.clientHeight;
      const indivisible = [
        ".mk-vshell",
        ".mk-diagram",
        ".mk-study",
        ".mk-formula",
        ".mk-cycle",
        ".mk-important",
        ".mk-remember",
        ".mk-experiment",
        ".mk-observation",
        ".mk-timeline",
        "pre",
        ".cmp-card",
        ".cmp-table",
        ".mk-cmp",
      ];
      for (const sel of indivisible) {
        const found = wrap.querySelectorAll(sel);
        for (let i = 0; i < found.length; i++) {
          const el = found[i] as HTMLElement;
          const natural = el.getBoundingClientRect().height;
          if (!Number.isFinite(natural) || natural <= 0) continue;
          const available = Math.max(200, pageH - 46);
          if (natural <= available + 1) continue;
          const k = Math.max(0.5, available / natural);
          el.style.transformOrigin = "top center";
          el.style.transform = `scale(${Math.round(k * 100) / 100})`;
          el.style.height = `${Math.round(natural * k)}px`;
        }
      }

      const advance = width + COLUMN_GAP;
      const count = Math.max(
        1,
        Math.ceil((wrap.scrollWidth + COLUMN_GAP) / advance)
      );

      /* Very long notes get one or two compact typesetting passes (markdown-style
         emphasis-free, tighter) so the page count stays notebook-like. */
      if (count > 9 && denseRef.current < 2) {
        denseRef.current += 1;
        setDense(denseRef.current);
        return;
      }

      const settled = Math.min(48, count);
      if (settled !== lastCount) {
        lastCount = settled;
        setColumnCount(settled);
      }
    };

    measure();

    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(measure);
      ro.observe(wrap);
    } catch {
      /* ResizeObserver unavailable in this environment */
    }

    let cancelled = false;
    const onFonts = async () => {
      try {
        await (document as Document & { fonts: FontFaceSet }).fonts.ready;
      } catch {
        /* fine */
      }
      try {
        await document.fonts.ready;
      } catch {
        /* fine */
      }
      if (!cancelled) measure();
    };
    void onFonts();
    const ticker = window.setInterval(measure, 800);

    return () => {
      interrupted = true;
      cancelled = true;
      ro?.disconnect();
      window.clearInterval(ticker);
    };
  }, [pages, isOnePage]);

  const effectiveCount = isOnePage ? 1 : columnCount;
  const index = Math.min(Math.max(0, currentPage), effectiveCount - 1);

  if (!pages.length) return null;

  return (
    <section
      id="generated-notes"
      className={[
        "mk-notes relative overflow-x-clip border-t border-white/[0.05] bg-[#09090B] pb-9 pt-5",
        isOnePage ? "mk-one-page" : "",
        dense ? "mk-dense" : "",
        dense > 1 ? "mk-dense-2" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto w-full">
        {/* top label */}
        <div className="mb-2.5 flex items-end justify-between px-4">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[#F5B700]">
              Your Kivraa notes
            </div>
            <div className="mk-notes-topic mt-1 text-xl font-black tracking-[-0.04em] text-white">
              {topic}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="rounded-full border border-white/[0.07] px-3 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-slate-500">
              {style}
            </span>
            {effectiveCount > 1 && (
              <span className="rounded-full border border-white/[0.07] px-3 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-slate-500">
                {index + 1} / {effectiveCount}
              </span>
            )}
          </div>
        </div>

        {/* notebook */}
        <div className="px-3">
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-5 bottom-[-8px] h-6 rounded-full bg-black/60 blur-2xl" />

            <div className="mk-note-card relative flex flex-col overflow-hidden rounded-[18px] border border-[#D8CFAE] bg-[#F8F1DE] shadow-[0_16px_48px_rgba(0,0,0,.44)]">
              {/* paper top */}
              <div className="absolute left-0 right-0 top-0 h-1.5 bg-[#F5B700]" />

              {/* paper grain — pure CSS texture */}
              <div aria-hidden="true" className="mk-paper-grain pointer-events-none absolute inset-0" />

              {/* red margin */}
              <div className="pointer-events-none absolute bottom-0 left-[24px] top-0 w-px bg-red-300/45" />

              {/* paper lines */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.38]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, transparent 0px, transparent 37px, rgba(70,90,110,.10) 38px)",
                }}
              />

              {/* page */}
              <div className="mk-page-body relative flex min-h-0 flex-1 flex-col px-5 pb-5 pt-4">
                {/* corner dots */}
                <div className="absolute right-4 top-4 flex gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F5B700]/70" />
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-300/70" />
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-300/70" />
                </div>

                {/* compact header */}
                <div className="mb-3 flex items-start gap-3">
                  <KivraaLogoStatic
                    className="shrink-0 -rotate-2"
                    size={36}
                  />

                  <div className="min-w-0 pr-4">
                    <div className="text-[8px] font-black uppercase tracking-[0.22em] text-[#9C8C57]">
                      study note
                    </div>

                    <div
                      className="mk-note-title mt-0.5 truncate text-[26px] font-bold leading-[1.05] text-[#142C49]"
                      style={{ fontFamily: hand }}
                    >
                      {topic}
                    </div>

                    <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-[#9B927D]">
                      learn it · connect it · remember it
                    </div>
                  </div>
                </div>

                {/* markdown body */}
                <div
                  className="mk-note-body flex-1 overflow-hidden break-words"
                  style={{
                    fontFamily: hand,
                    transform: sheetScale < 1 ? `scaleY(${sheetScale})` : undefined,
                    transformOrigin: "top center",
                  }}
                >
                  {isOnePage ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={makeNoteComponents(style)}
                    >
                      {prepareNotePage(prepareOnePage(pages[0] || ""))}
                    </ReactMarkdown>
                  ) : (
                    <div
                      ref={pagesRef}
                      className="mk-pages"
                      style={{
                        columnWidth: `${pageWidth || 300}px`,
                        transform: `translateX(${
                          -index * ((pageWidth || 300) + COLUMN_GAP)
                        }px)`,
                      }}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={makeNoteComponents(style)}
                      >
                        {prepareNotePage(pages.join("\n\n"))}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* page footer */}
                <div className="mt-4 flex items-center justify-between border-t border-[#D7CEB3] pt-2.5">
                  <span className="text-[11px] italic text-[#9D947D]">
                    Kivraa · make the idea click
                  </span>
                  <span className="text-[11px] font-bold text-[#9D947D]">
                    {index + 1}
                    {effectiveCount > 1 ? ` / ${effectiveCount}` : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* pagination — buttons only, hidden for One Page */}
        {effectiveCount > 1 && (
          <div className="px-3 pt-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={index === 0}
                className="min-h-[48px] min-w-[108px] touch-manipulation rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-[13px] font-bold text-slate-300 transition active:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-25"
              >
                ← Prev
              </button>

              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="flex items-center gap-1"
                  aria-label={`Page ${index + 1} of ${effectiveCount}`}
                >
                  {Array.from({ length: effectiveCount }).map((_, i) => (
                    <span
                      key={i}
                      className={[
                        "h-1.5 rounded-full transition-all duration-300",
                        i === index ? "w-5 bg-[#F5B700]" : "w-1.5 bg-white/[0.18]",
                      ].join(" ")}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  {index + 1} / {effectiveCount}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(effectiveCount - 1, p + 1))
                }
                disabled={index === effectiveCount - 1}
                className="min-h-[48px] min-w-[108px] touch-manipulation rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-[13px] font-bold text-slate-300 transition active:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-25"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Kivraa signature mark — once per section */}
        <p className="mk-kivraa-mark px-4 pb-1 pt-5 text-center text-[10px] font-medium tracking-[0.22em] text-[#F5B700]/60">
          ✎ KIVRAA · SMART NOTES
        </p>
      </div>

      <style jsx global>{`
        .mk-notes .katex {
          font-size: 1em;
        }
        .mk-notes .katex-display {
          font-size: 0.97em;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 5px 0;
          max-width: 100%;
        }
      `}</style>
    </section>
  );
}