"use client";

import NoteMarkdown from "./NoteMarkdown";
import VisualBlock from "./VisualBlock";
import { parseNoteBlocks } from "./parseNoteBlocks";
import type { NoteStyle } from "./types";

export default function NotePageContent({
  content,
  style,
}: {
  content: string;
  style: NoteStyle;
}) {
  const segments = parseNoteBlocks(content || "");

  if (!Array.isArray(segments) || segments.length === 0) {
    return (
      <div className="kivraa-note-page">
        <div className="kivraa-note-flow">
          <NoteMarkdown content={content || ""} style={style} />
        </div>
      </div>
    );
  }

  return (
    <div className="kivraa-note-page">
      <div className="kivraa-note-flow">
        {segments.map((segment, index) => {
          if (!segment) return null;

          if (segment.kind === "markdown") {
            return (
              <div
                key={`markdown-${index}`}
                className="kivraa-note-section"
              >
                <NoteMarkdown
                  content={segment.content}
                  style={style}
                />
              </div>
            );
          }

          return (
            <div
              key={`${segment.kind}-${segment.id || index}`}
              className={`kivraa-note-visual kivraa-note-visual-${segment.kind}`}
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
  );
}