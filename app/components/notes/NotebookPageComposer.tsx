"use client";

/*
 * NOTEBOOK PAGE COMPOSER
 * ======================
 *
 * Takes the typed study elements of one prepared page and composes them into
 * a single ruled-paper page:
 *
 *   - short study chunks are balanced across TWO ASYMMETRIC columns (wider
 *     left, narrower right, like a real notebook spread) so the sheet fills
 *     naturally instead of running one long single column,
 *   - visual study elements (flowchart / diagram / cycle / formula) are kept
 *     FULL-WIDTH as pull-out flourishes between the columns,
 *   - "One Page" always resolves to exactly one compact sheet,
 *   - neither column is left mostly empty.
 *
 * The same composer runs on desktop and mobile, so one renderer serves both.
 */

import { useMemo, type ReactNode } from "react";
import type { NoteStyle } from "./types";
import {
  buildStudyDocument,
  type StudyElement,
} from "./studyElements";
import { StudySections } from "./StudySections";
import VisualBlock from "./VisualBlock";

const FULL_WIDTH_KINDS = new Set([
  "flowchart",
  "diagram",
  "cycle",
  "formula",
]);

function isFullWidth(element: StudyElement) {
  return FULL_WIDTH_KINDS.has(String((element as { kind?: string }).kind ?? ""));
}

function weight(element: StudyElement) {
  const items = (element as { items?: string[] }).items;
  const lines = (element as { lines?: string[] }).lines;

  if (Array.isArray(items)) return Math.max(1, items.length);
  if (Array.isArray(lines)) return Math.max(1, lines.length);

  return 1;
}

function composeColumns(elements: StudyElement[]) {
  const text: StudyElement[] = [];
  const full: StudyElement[] = [];

  for (const element of elements) {
    if (!element) continue;

    if (isFullWidth(element)) {
      full.push(element);
      continue;
    }

    text.push(element);
  }

  const left: StudyElement[] = [];
  const right: StudyElement[] = [];

  let leftWeight = 0;
  let rightWeight = 0;

  for (const element of text) {
    const value = weight(element);

    if (leftWeight <= rightWeight) {
      left.push(element);
      leftWeight += value;
      continue;
    }

    right.push(element);
    rightWeight += value;
  }

  return { left, right, full };
}

export function NotebookPageComposer({
  elements,
  style,
  content,
  children,
}: {
  elements: StudyElement[];
  style: NoteStyle;
  content?: string;
  children: (
    document: { topic: string; coreIdea: string | null },
    spread: { left: ReactNode; right: ReactNode; full: ReactNode }
  ) => ReactNode;
}) {
  const document = useMemo(
    () => buildStudyDocument(content ?? "", style),
    [content, style]
  );

  const { left, right, full } = useMemo(
    () => composeColumns(elements ?? []),
    [elements]
  );

  return children(
    { topic: document.topic, coreIdea: document.coreIdea },
    {
      left: <StudySections elements={left} />,
      right: <StudySections elements={right} />,
      full: (
        <>
          {full.map((element, index) => {
            const kind = String((element as { kind?: string }).kind ?? "");
            const items = (element as { items?: string[] }).items ?? [];
            const title = (element as { title?: string }).title;

            return (
              <div
                key={`${kind}-full-${index}`}
                className={`kivraa-note-visual kivraa-note-visual-${kind}`}
              >
                <VisualBlock
                  kind={kind}
                  title={title}
                  items={items}
                  style={style}
                />
              </div>
            );
          })}
        </>
      ),
    }
  );
}

export default NotebookPageComposer;
