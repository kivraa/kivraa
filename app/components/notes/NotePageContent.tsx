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

  if (!Array.isArray(segments) || !segments.length) {
    return <NoteMarkdown content={content || ""} style={style} />;
  }

  return (
    <div className="kivraa-note-page font-sans">
      {segments.map((segment, index) => {
        if (!segment) return null;

        if (segment.kind === "markdown") {
          return (
            <NoteMarkdown
              key={`md-${index}`}
              content={segment.content}
              style={style}
            />
          );
        }

        return (
          <VisualBlock
            key={`${segment.kind}-${segment.id || index}`}
            kind={segment.kind}
            title={segment.title}
            items={segment.items}
            style={style}
          />
        );
      })}
    </div>
  );
}
