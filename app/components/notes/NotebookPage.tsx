"use client";

/*
 * NOTEBOOK PAGE
 * =============
 *
 * A single ruled-paper notebook sheet holding one composed page of study
 * copy. The sheet itself is owned by the shared shell (StudentNotebook.tsx);
 * this component owns everything that sits ON the page:
 *
 *   - the pinned "core idea" strip (compact, never a giant heading card),
 *   - the asymmetric two-column study spread (one column on mobile),
 *   - the short study chunks and the full-width visual pull-outs.
 *
 * Short study chunks and visual study elements are both rendered through
 * StudySections, so desktop and mobile share the exact same renderer.
 */

import type { ReactNode } from "react";
import type { NoteStyle } from "./types";

export type NotebookPageProps = {
  document: {
    topic: string;
    coreIdea: string | null;
  };
  spread: {
    left: ReactNode;
    right: ReactNode;
    full?: ReactNode;
  };
  style: NoteStyle;
};

export default function NotebookPage({
  document,
  spread,
}: NotebookPageProps) {
  return (
    <div className="kivraa-note-page">
      <div className="kivraa-note-flow">
        {document.coreIdea ? (
          <div className="kivraa-note-core-idea">
            <span className="kivraa-note-core-kicker">core idea</span>
            <span className="kivraa-note-core-title">
              {document.coreIdea}
            </span>
          </div>
        ) : null}

        <div className="kivraa-note-study-columns">
          <div className="kivraa-note-column kivraa-note-column-left">
            {spread.left}
          </div>

          <div className="kivraa-note-column kivraa-note-column-right">
            {spread.right}
          </div>

          {spread.full}
        </div>
      </div>
    </div>
  );
}

export { NotebookPage };
