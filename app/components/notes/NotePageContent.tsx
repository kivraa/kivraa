"use client";

import NoteMarkdown from "./NoteMarkdown";
import VisualBlock from "./VisualBlock";
import { parseNoteBlocks } from "./parseNoteBlocks";
import type { NoteStyle } from "./types";

/**
 * Study-copy content layer.
 *
 * This is the ONE place a generated page is turned into something that reads
 * like a student's own study copy instead of a continuous AI article:
 *
 *   • a compact pinned “core idea” strip pulled out of the lead markdown,
 *   • short natural study chunks that flow into TWO ASYMMETRIC COLUMNS on
 *     wider screens (like a real notebook spread) and one column on mobile,
 *   • flowcharts / diagrams / cycles / formulas / important / remember /
 *     example blocks are kept exactly as their existing VisualBlock accent,
 *     but rendered FULL-WIDTH so they act as pull-out “make it click”
 *     flourishes between the columns,
 *   • Geist only — no cursive, no handwriting fonts, no giant rounded cards,
 *     no giant yellow headings, no paragraph-upon-paragraph article flow.
 */

const HEADING_RE = /^\s{0,3}#{1,4}\s+(.+)$/gm;

function pullCoreIdea(markdown: string) {
  const match = HEADING_RE.exec(markdown);

  const title = match
    ? match[1].replace(/[*_`#]/g, "").trim()
    : "";

  const body = match
    ? markdown
        .slice(0, match.index) +
      "\n" +
      markdown.slice(match.index + match[0].length)
    : markdown;

  return {
    title,
    body: body.replace(/\n{3,}/g, "\n\n").trim(),
  };
}

export default function NotePageContent({
  content,
  style,
}: {
  content: string;
  style: NoteStyle;
}) {
  const segments = parseNoteBlocks(content || "");

  if (!segments.length) {
    return (
      <div className="kivraa-note-page">
        <div className="kivraa-note-flow">
          <NoteMarkdown
            content={content || ""}
            style={style}
          />
        </div>
      </div>
    );
  }

  const firstMarkdownIndex = segments.findIndex(
    (segment) => segment.kind === "markdown"
  );

  const isSingleMarkdown =
    segments.length === 1 && firstMarkdownIndex === 0;

  return (
    <div className="kivraa-note-page">
      {isSingleMarkdown ? (
        /* Plain prose-only copy: compact, single natural column. */
        <div className="kivraa-note-flow">
          <NoteMarkdown
            content={content || ""}
            style={style}
          />
        </div>
      ) : (
        /* Study-copy spread: two asymmetric columns + full-width visuals. */
        <div className="kivraa-note-flow">
          {/* Pinned core idea — pulled from the lead heading, not a giant h1 */}
          {firstMarkdownIndex !== -1 ? (() => {
            const lead = segments[firstMarkdownIndex];
            const core = pullCoreIdea(
              lead.kind === "markdown" ? lead.content : ""
            );

            if (!core.title) return null;

            return (
              <div className="kivraa-note-core-idea">
                <span className="kivraa-note-core-kicker">
                  core idea
                </span>
                <span className="kivraa-note-core-title">
                  {core.title}
                </span>
              </div>
            );
          })() : null}

          {/* two-column chunking */}
          <div className="kivraa-note-study-columns">
            {segments.map((segment, index) => {
              if (!segment) return null;

              if (segment.kind === "markdown") {
                const isLead = index === firstMarkdownIndex;

                const chunkContent = isLead
                  ? pullCoreIdea(segment.content).body || segment.content
                  : segment.content;

                if (!chunkContent.trim()) return null;

                return (
                  <div
                    className="kivraa-note-chunk"
                    key={`markdown-${index}`}
                  >
                    <NoteMarkdown
                      content={chunkContent}
                      style={style}
                    />
                  </div>
                );
              }

              return (
                <div
                  className={`kivraa-note-visual kivraa-note-visual-${segment.kind}`}
                  key={`visual-${index}`}
                >
                  <VisualBlock
                    kind={segment.kind}
                    title={segment.title}
                    items={segment.items}
                    style={style}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
