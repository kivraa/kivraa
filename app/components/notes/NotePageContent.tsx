"use client";

/*
 * NOTE PAGE CONTENT - the one place a generated note becomes a study copy
 *
 *   generated content
 *     -> parseStudyDocument()   typed sections + study elements
 *     -> shapeDocument()        class / purpose / style adaptation
 *     -> buildBlocks()          content-sized blocks
 *     -> paginate()             content-driven page count
 *     -> composePages()         asymmetric page composition
 *     -> NotebookPage           the ruled sheet
 *
 * This is the ONLY entry point to the renderer. Desktop and mobile both come
 * through here, so the notebook is identical everywhere.
 */

import { useMemo } from "react";
import {
  parseStudyDocument,
  shapeDocument,
  type StudyContext,
  type StudyDocument,
} from "./studyElements";
import {
  buildBlocks,
  composePages,
  elementUnits,
  isSketch,
  PAGE_UNITS,
  paginate,
  type ComposedPage,
  type StudyBlock,
} from "./studyComposer";
import { NotebookPage } from "./NotebookPage";
import type { ClassLevel, NotePurpose, NoteStyle } from "./types";

export type StudyNotebook = {
  document: StudyDocument;
  pages: ComposedPage[];
};

/*
 * One Page is genuinely ONE page: high-value material is added until the
 * sheet is full, and then it stops. Nothing is padded, nothing is crammed.
 */
function singlePageBlocks(blocks: StudyBlock[]) {
  const kept: StudyBlock[] = [];
  let used = 0;

  for (const block of blocks) {
    if (used + block.units > PAGE_UNITS && kept.length) break;
    kept.push(block);
    used += block.units;
  }

  if (!kept.length && blocks.length) kept.push(blocks[0]);

  return kept;
}

export function buildNotebook({
  content,
  topic,
  style,
  classLevel,
  purpose,
}: {
  content: string;
  topic?: string;
  style: NoteStyle;
  classLevel?: ClassLevel | null;
  purpose?: NotePurpose | null;
}): StudyNotebook {
  const context: StudyContext = { style, classLevel: classLevel ?? null, purpose: purpose ?? null };

  const parsed = parseStudyDocument(content, topic);
  const shaped = shapeDocument(parsed, context);
  const blocks = buildBlocks(shaped);

  if (!blocks.length) {
    return { document: { ...shaped, sections: [] }, pages: [] };
  }

  if (style === "One Page") {
    const page = composePages([singlePageBlocks(blocks)])[0];
    return { document: shaped, pages: page ? [page] : [] };
  }

  return { document: shaped, pages: composePages(paginate(blocks)) };
}

export function NotebookPageView({
  notebook,
  pageIndex,
  style,
}: {
  notebook: StudyNotebook;
  pageIndex: number;
  style: NoteStyle;
}) {
  const page = notebook.pages[pageIndex];

  if (!page) {
    return (
      <div className="kv-page">
        <div className="kv-chunk">
          <p className="kv-fact">Is page par abhi kuch nahi hai.</p>
        </div>
      </div>
    );
  }

  return (
    <NotebookPage page={page} document={notebook.document} style={style} />
  );
}

export default function NotePageContent({
  content,
  topic,
  style,
  classLevel,
  purpose,
  pageIndex = 0,
}: {
  content: string;
  topic?: string;
  style: NoteStyle;
  classLevel?: ClassLevel | null;
  purpose?: NotePurpose | null;
  pageIndex?: number;
}) {
  const notebook = useMemo(
    () => buildNotebook({ content, topic, style, classLevel, purpose }),
    [content, topic, style, classLevel, purpose]
  );

  return <NotebookPageView notebook={notebook} pageIndex={pageIndex} style={style} />;
}

export { elementUnits, isSketch };
