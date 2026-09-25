"use client";

/*
 * NOTEBOOK PAGE
 * =============
 *
 * One composed sheet of study copy:
 *
 *   - a compact hand-marked page title (highlighter stroke + bracket, never a
 *     giant heading card),
 *   - numbered section headings with a hand rule underneath,
 *   - an asymmetric two-column spread (wider left, narrower right) or a
 *     single honest column when the material is short,
 *   - full-width sketches placed where the student would use the whole page.
 *
 * The paper itself (ruling, red margin, page edge) belongs to the shell.
 */

import type { ComposedPage, ComposedSection } from "./studyComposer";
import type { StudyElement, StudyDocument } from "./studyElements";
import { StudyElementView } from "./StudyElementView";
import type { NoteStyle } from "./types";

type Placed = { element: StudyElement; index: number; termIndex: number };

/*
 * The first term a student would underline on THIS page gets the highlighter.
 * The counter therefore runs across the whole page, not per section, so a page
 * never ends up with four competing yellow strokes.
 */
function placeElements(sections: ComposedSection[], startTerm: number) {
  let term = startTerm;
  const placed: Array<{ section: ComposedSection; items: Placed[] }> = [];

  for (const section of sections) {
    const items: Placed[] = section.elements.map((element, index) => {
      const isTerm = element.kind === "keyword" || element.kind === "definition";
      const termIndex = isTerm ? term++ : -1;
      return { element, index, termIndex };
    });
    placed.push({ section, items });
  }

  return { placed, nextTerm: term };
}

function SectionBlock({
  section,
  items,
  style,
}: {
  section: ComposedSection;
  items: Placed[];
  style: NoteStyle;
}) {
  if (!items.length) return null;

  return (
    <section className="kv-section">
      <h3 className="kv-section-heading">
        <span className="kv-section-number" aria-hidden="true">
          {section.number}
        </span>
        <span className="kv-section-title">{section.heading}</span>
        <span className="kv-section-rule" aria-hidden="true" />
      </h3>

      <div className="kv-section-body">
        {items.map(({ element, index, termIndex }) => (
          <StudyElementView
            key={`${element.kind}-${index}`}
            element={element}
            style={style}
            index={index}
            termIndex={termIndex}
          />
        ))}
      </div>
    </section>
  );
}

function PageTitle({
  topic,
  coreIdea,
}: {
  topic: string;
  coreIdea: string | null;
}) {
  return (
    <header className="kv-page-head">
      <h2 className="kv-page-title">
        <span className="kv-page-title-stroke" aria-hidden="true" />
        <span className="kv-page-title-text">{topic}</span>
      </h2>

      {coreIdea ? (
        <p className="kv-page-core">
          <span className="kv-page-core-label">core idea</span>
          <span className="kv-page-core-text">{coreIdea}</span>
        </p>
      ) : null}
    </header>
  );
}

export default function NotebookPage({
  page,
  document,
  style,
}: {
  page: ComposedPage;
  document: StudyDocument;
  style: NoteStyle;
}) {
  const hasRight = page.layout === "spread" && page.right.length > 0;
  const left = placeElements(page.left, 0);
  const right = hasRight ? placeElements(page.right, left.nextTerm) : null;

  return (
    <div className="kv-page" data-layout={page.layout}>
      {page.showTitle ? (
        <PageTitle topic={document.topic} coreIdea={document.coreIdea} />
      ) : null}

      <div className="kv-page-columns">
        <div className="kv-column kv-column-left">
          {left.placed.map(({ section, items }) => (
            <SectionBlock
              key={`${section.number}-${section.heading}-l`}
              section={section}
              items={items}
              style={style}
            />
          ))}
        </div>

        {right ? (
          <div className="kv-column kv-column-right">
            {right.placed.map(({ section, items }) => (
              <SectionBlock
                key={`${section.number}-${section.heading}-r`}
                section={section}
                items={items}
                style={style}
              />
            ))}
          </div>
        ) : null}
      </div>

      {page.full.length ? (
        <div className="kv-page-sketches">
          {page.full.map((element, index) => (
            <StudyElementView
              key={`${element.kind}-full-${index}`}
              element={element}
              style={style}
              index={index}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { NotebookPage };
