"use client";

/*
 * STUDY ELEMENT VIEW
 * ==================
 *
 * Turns one typed study element into one mark on the ruled paper.
 *
 * The "handwritten" quality is created by LAYOUT and MARKS, never by a
 * handwriting font: uneven underline lengths, occasional circles, brackets,
 * arrows, small margin symbols and deliberately uneven indents. The type
 * itself stays Geist/system so the copy is always readable.
 *
 * Colour carries meaning only:
 *   - a term introduced once gets a yellow highlight,
 *   - recurring terms get a hand-drawn underline,
 *   - a few get a loose circle,
 *   - everything else stays plain ink.
 */

import type { ReactNode } from "react";
import { SYM, type StudyElement } from "./studyElements";
import StudySketch from "./StudySketch";
import type { NoteStyle } from "./types";

/* stable per-text variation, so a rerender never makes marks jump around */
function stableIndex(value: string, salt = 0) {
  let hash = salt;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 9973;
  }
  return hash;
}

type Emphasis = "marked" | "circled" | "underlined";

function emphasisFor(index: number, value: string): Emphasis {
  if (index === 0) return "marked";
  if (index % 4 === 2) return "circled";
  if (stableIndex(value, index) % 5 === 0) return "circled";
  return "underlined";
}

function Chunk({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["kv-chunk", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

function Term({
  children,
  emphasis,
}: {
  children: ReactNode;
  emphasis: Emphasis;
}) {
  return (
    <span className={`kv-term kv-term-${emphasis}`}>{children}</span>
  );
}

/* ------------------------------------------------------------- annotations */

const ANNOTATION: Record<
  string,
  { label: string; symbol: string; tone: string }
> = {
  important: { label: "Important", symbol: "!", tone: "red" },
  remember: { label: "Remember", symbol: SYM.star, tone: "purple" },
  "exam-tip": { label: "Exam", symbol: SYM.arrow, tone: "blue" },
  example: { label: "Example", symbol: SYM.arrow, tone: "green" },
  application: { label: "Use", symbol: SYM.arrow, tone: "blue" },
  "common-confusion": { label: "Careful", symbol: "?", tone: "red" },
  why: { label: "Why?", symbol: "?", tone: "purple" },
};

function Annotation({
  kind,
  items,
  index,
}: {
  kind: string;
  items: string[];
  index: number;
}) {
  if (!items.length) return null;

  const meta = ANNOTATION[kind] ?? ANNOTATION.important;
  const tilt = (stableIndex(kind, index) % 3) - 1;

  return (
    <div
      className={`kv-annotation kv-annotation-${meta.tone}`}
      style={tilt ? ({ "--kv-tilt": `${tilt * 0.35}deg` } as React.CSSProperties) : undefined}
    >
      <span className="kv-annotation-mark" aria-hidden="true">
        {meta.symbol}
      </span>

      <div className="kv-annotation-body">
        <span className="kv-annotation-label">{meta.label}</span>

        {items.map((item, itemIndex) => (
          <p className="kv-annotation-line" key={`${item}-${itemIndex}`}>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- pieces */

function FactList({
  lines,
  arrowed,
}: {
  lines: string[];
  arrowed: boolean;
}) {
  return (
    <div className="kv-facts">
      {lines.map((line, lineIndex) => {
        const showArrow = arrowed && lineIndex % 2 === 0;
        const indent = stableIndex(line, lineIndex) % 3 === 0;

        return (
          <p
            className={[
              "kv-fact",
              showArrow ? "kv-fact-arrow" : "",
              indent ? "kv-fact-indent" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={`${line}-${lineIndex}`}
          >
            {showArrow ? (
              <span className="kv-fact-arrow-mark" aria-hidden="true">
                {SYM.arrow}
              </span>
            ) : null}
            <span>{line}</span>
          </p>
        );
      })}
    </div>
  );
}

function KeywordLine({
  keyword,
  rest,
  index,
}: {
  keyword: string;
  rest?: string;
  index: number;
}) {
  return (
    <p className="kv-keyword-line">
      <Term emphasis={emphasisFor(index, keyword)}>{keyword}</Term>
      {rest ? <span className="kv-keyword-rest">{rest}</span> : null}
    </p>
  );
}

function DefinitionLine({
  term,
  meaning,
  index,
}: {
  term: string;
  meaning: string;
  index: number;
}) {
  return (
    <p className="kv-definition">
      <Term emphasis={emphasisFor(index, term)}>{term}</Term>
      <span className="kv-definition-rule" aria-hidden="true" />
      <span className="kv-definition-meaning">{meaning}</span>
    </p>
  );
}

function NumberedSteps({
  items,
  className,
}: {
  items: string[];
  className: string;
}) {
  return (
    <ol className={className}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          <span className="kv-step-num" aria-hidden="true">
            {index + 1}
          </span>
          <span className="kv-step-text">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function ComparisonPair({ a, b }: { a: string; b: string }) {
  return (
    <div className="kv-comparison">
      <div className="kv-comparison-side kv-comparison-a">
        <span className="kv-comparison-bar" aria-hidden="true" />
        <span>{a}</span>
      </div>

      <span className="kv-comparison-vs" aria-hidden="true">
        vs
      </span>

      <div className="kv-comparison-side kv-comparison-b">
        <span className="kv-comparison-bar" aria-hidden="true" />
        <span>{b}</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- dispatch */

export function StudyElementView({
  element,
  style,
  index,
  termIndex = -1,
}: {
  element: StudyElement;
  style: NoteStyle;
  index: number;
  termIndex?: number;
}) {
  switch (element.kind) {
    case "concept":
    case "key-point":
      return (
        <Chunk className="kv-chunk-facts">
          <FactList lines={element.lines} arrowed />
        </Chunk>
      );

    case "example":
      return (
        <Chunk className="kv-chunk-example">
          <FactList lines={element.lines} arrowed={false} />
        </Chunk>
      );

    case "keyword":
      return (
        <Chunk className="kv-chunk-keyword">
          <KeywordLine
            keyword={element.keyword}
            rest={element.rest}
            index={termIndex >= 0 ? termIndex : index}
          />
        </Chunk>
      );

    case "definition":
      return (
        <Chunk className="kv-chunk-definition">
          <DefinitionLine
            term={element.term}
            meaning={element.meaning}
            index={termIndex >= 0 ? termIndex : index}
          />
        </Chunk>
      );

    case "bullet":
      return (
        <Chunk className="kv-chunk-bullet">
          <ul className="kv-bullets">
            {element.items.map((item, itemIndex) => (
              <li key={`${item}-${itemIndex}`}>
                <span className="kv-bullet-mark" aria-hidden="true">
                  {itemIndex % 3 === 1 ? SYM.arrow : SYM.bullet}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Chunk>
      );

    case "numbered":
      return (
        <Chunk className="kv-chunk-numbered">
          <NumberedSteps items={element.items} className="kv-steps" />
        </Chunk>
      );

    case "process":
      return (
        <Chunk className="kv-chunk-process">
          <NumberedSteps items={element.steps} className="kv-steps kv-steps-flow" />
        </Chunk>
      );

    case "cause-effect":
      return (
        <Chunk className="kv-chunk-relation">
          <p className="kv-relation">
            <span>{element.cause}</span>
            <span className="kv-relation-arrow" aria-hidden="true">
              {SYM.arrow}
            </span>
            <span>{element.effect}</span>
          </p>
        </Chunk>
      );

    case "comparison":
      return (
        <Chunk className="kv-chunk-comparison">
          <ComparisonPair a={element.a} b={element.b} />
        </Chunk>
      );

    case "flowchart":
    case "diagram":
    case "cycle":
    case "formula":
      return (
        <Chunk className="kv-chunk-sketch">
          <StudySketch element={element} style={style} />
        </Chunk>
      );

    case "important":
    case "remember":
    case "exam-tip":
    case "application":
    case "common-confusion":
    case "why":
      return (
        <Chunk className="kv-chunk-annotation">
          <Annotation kind={element.kind} items={element.items} index={index} />
        </Chunk>
      );

    default:
      return null;
  }
}

export default StudyElementView;
