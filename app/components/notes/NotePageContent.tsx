"use client";

/*
 * NOTE PAGE CONTENT - THE STUDY-COPY PRESENTATION ENTRY
 * ======================================================
 *
 * This is the ONE place a generated notebook page is turned into a student's
 * own study copy. Earlier this file presented the generated material as a
 * continuous markdown "AI article" (paragraph after paragraph through
 * NoteMarkdown). That was rejected. It is now a clean, isolated pipeline:
 *
 *   generated content
 *      -> parseStudyElements()       typed, short study elements
 *      -> StudyDocument              topic + pinned core idea
 *      -> StudySections              short study chunks + visual elements
 *      -> NotebookPageComposer       asymmetric two-column spread
 *      -> NotebookPage               the ruled-paper sheet
 *
 * Rules this entry guarantees:
 *   - the SAME renderer on desktop and mobile (both go through StudentNotebook),
 *   - no paragraph-after-paragraph article flow, no giant yellow heading cards,
 *   - flowcharts / diagrams / cycles / formulas stay compact student sketches,
 *   - important / remember / example / exam-tip stay small margin annotations,
 *   - Geist only: no Kalam, no cursive, no handwriting fonts.
 */

import { parseStudyElements } from "./studyElements";
import { NotebookPageComposer } from "./NotebookPageComposer";
import { NotebookPage } from "./NotebookPage";
import type { NoteStyle } from "./types";

export default function NotePageContent({
  content,
  style,
}: {
  content: string;
  style: NoteStyle;
}) {
  const source = content || "";
  const elements = parseStudyElements(source);

  if (!elements.length) {
    return (
      <div className="kivraa-note-page">
        <div className="kivraa-note-flow">
          <div className="kivraa-note-chunk">
            <p className="kivraa-note-concept">
              Re-read the topic once more - the study copy is taking shape.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <NotebookPageComposer elements={elements} style={style} content={source}>
      {(pageDocument, spread) => (
        <NotebookPage document={pageDocument} spread={spread} style={style} />
      )}
    </NotebookPageComposer>
  );
}
