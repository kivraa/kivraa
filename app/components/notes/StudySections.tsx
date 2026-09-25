"use client";

/*
 * STUDY SECTIONS
 * ==============
 *
 * Renders one composed chunk of a notebook page. This is where a typed
 * StudyElement becomes an actual mark on the ruled paper:
 *
 *   - short concepts / key points / definitions / relationships become
 *     SHORT study chunks (1-3 lines), never article paragraphs,
 *   - keywords get the student's own underline + selective highlight,
 *   - important / remember / example / exam-tip become SMALL margin
 *     annotations, never giant yellow cards,
 *   - flowcharts / diagrams / cycles / formulas are delegated to the
 *     existing student-sketch VisualBlock renderers (compact vertical
 *     flows with simple outlined shapes + arrows, never SaaS boxes).
 *
 * Every visual kind flows through one dispatcher so the notebook looks
 * the same on desktop and mobile.
 */

import type { ReactNode } from "react";
import type { StudyElement } from "./studyElements";

function chunk(node: ReactNode, key: string, tone?: string) {
  return (
    <div
      key={key}
      className={[
        "kivraa-note-chunk",
        tone ? `kivraa-note-chunk-${tone}` : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {node}
    </div>
  );
}

function lineList(
  lines: string[] | undefined,
  className: string
) {
  if (!lines?.length) return null;

  return (
    <ul className={className}>
      {lines.map((line, index) => (
        <li key={`${line}-${index}`}>{line}</li>
      ))}
    </ul>
  );
}

function annotation(
  label: string,
  symbol: string,
  tone: string,
  items: string[] | undefined
) {
  if (!items?.length) return null;

  return (
    <div className={`kivraa-note-annotation kivraa-note-annotation-${tone}`}>
      <span className="kivraa-note-annotation-mark" aria-hidden="true">
        {symbol}
      </span>

      <div className="kivraa-note-annotation-body">
        <span className="kivraa-note-annotation-label">{label}</span>
        {lineList(items, "kivraa-note-annotation-lines")}
      </div>
    </div>
  );
}

function shortChunk(element: StudyElement, key: string) {
  if (element.kind === "short-concept" || element.kind === "key-point") {
    return chunk(
      <div className="kivraa-note-concept">
        {lineList(element.lines, "kivraa-note-concept-lines")}
      </div>,
      key
    );
  }

  if (element.kind === "keyword") {
    return chunk(
      <p className="kivraa-note-keyword-line">
        <span className="kivraa-note-keyword">{element.keyword}</span>
        {element.rest ? (
          <span className="kivraa-note-keyword-rest">{element.rest}</span>
        ) : null}
      </p>,
      key
    );
  }

  if (element.kind === "numbered-process") {
    return chunk(
      <div>
        <span className="kivraa-note-mini-heading">step by step</span>
        <ol className="kivraa-note-process">
          {element.items.map((item, index) => (
            <li key={`${item}-${index}`}>
              <span className="kivraa-note-process-step">{index + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>,
      key
    );
  }

  if (element.kind === "definition") {
    return chunk(
      <p className="kivraa-note-definition">
        <span className="kivraa-note-definition-term">
          {element.term}
        </span>
        <span className="kivraa-note-definition-arrow">:</span>
        <span className="kivraa-note-definition-meaning">
          {element.meaning}
        </span>
      </p>,
      key
    );
  }

  if (element.kind === "comparison") {
    return chunk(
      <div className="kivraa-note-comparison">
        <div className="kivraa-note-comparison-side">
          {element.a}
        </div>
        <div className="kivraa-note-comparison-vs">vs</div>
        <div className="kivraa-note-comparison-side">
          {element.b}
        </div>
      </div>,
      key
    );
  }

  if (element.kind === "relationship") {
    return chunk(
      <p className="kivraa-note-relationship">
        <span>{element.a}</span>
        <span className="kivraa-note-relationship-arrow">-&gt;</span>
        <span>{element.b}</span>
      </p>,
      key
    );
  }

  if (element.kind === "cause-effect") {
    return chunk(
      <p className="kivraa-note-relationship kivraa-note-relationship-cause">
        <span>{element.cause}</span>
        <span className="kivraa-note-relationship-arrow">-&gt;</span>
        <span>{element.effect}</span>
      </p>,
      key
    );
  }

  if (element.kind === "formula") {
    return chunk(
      <div className="kivraa-note-formula-line">
        {element.items.map((item, index) => (
          <span key={`${item}-${index}`} className="kivraa-note-formula">
            {item}
          </span>
        ))}
      </div>,
      key
    );
  }

  return null;
}

export function StudySections({
  elements,
}: {
  elements: StudyElement[];
}) {
  if (!elements?.length) return null;

  return (
    <>
      {elements.map((element, index) => {
        const key = `${element.kind}-${index}`;

        if (element.kind === "important") {
          return chunk(
            annotation("Important", "!", "important", element.items),
            key,
            "annotation"
          );
        }

        if (element.kind === "remember") {
          return chunk(
            annotation("Remember", "*", "remember", element.items),
            key,
            "annotation"
          );
        }

        if (element.kind === "example") {
          return chunk(
            annotation("Example", "e", "example", element.items),
            key,
            "annotation"
          );
        }

        if (element.kind === "exam-tip") {
          return chunk(
            annotation("Exam tip", "!", "exam", element.items),
            key,
            "annotation"
          );
        }

        return shortChunk(element, key);
      })}
    </>
  );
}

export default StudySections;
