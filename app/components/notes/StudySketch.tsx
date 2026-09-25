"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { SYM, type SketchNode, type StudyElement } from "./studyElements";
import type { NoteStyle } from "./types";

/*
 * STUDY SKETCHES
 * ==============
 *
 * The drawn parts of the study copy. These are student sketches, not UI:
 *
 *   - a FLOW is a compact vertical chain with real down arrows,
 *   - a STRUCTURE is a containment sketch (boxes inside boxes) with leader
 *     lines, the way a student draws a chloroplast or a CPU,
 *   - a CYCLE is a chain that loops back to its start,
 *   - a FORMULA sits directly on the paper with its conditions underneath
 *     and a tiny glossary beside it - never inside a card.
 *
 * Everything is sized by its own content, so a 3-step flow never wastes half
 * a page and a 6-step flow never gets squeezed.
 */

const INK = ["blue", "purple", "red", "orange"] as const;

function inkFor(index: number) {
  return INK[index % INK.length];
}

function MathLine({ value }: { value: string }) {
  return (
    <div className="kv-sketch-math">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {`$$${value}$$`}
      </ReactMarkdown>
    </div>
  );
}

function Scribble({ children }: { children: React.ReactNode }) {
  return <span className="kv-sketch-scribble">{children}</span>;
}

/* ------------------------------------------------------------------- flow */

function SketchFlow({
  steps,
  title,
  style,
}: {
  steps: string[];
  title?: string;
  style: NoteStyle;
}) {
  if (!steps.length) return null;

  return (
    <figure className="kv-sketch kv-sketch-flow">
      {title ? <Scribble>{title}</Scribble> : null}

      <ol className="kv-sketch-flow-chain">
        {steps.map((step, index) => (
          <li className="kv-sketch-flow-row" key={`${step}-${index}`}>
            <div className={`kv-sketch-flow-node kv-ink-${inkFor(index)}`}>
              {style !== "Simple" ? (
                <span className="kv-sketch-flow-num" aria-hidden="true">
                  {index + 1}
                </span>
              ) : null}
              <span className="kv-sketch-flow-text">{step}</span>
            </div>
            {index < steps.length - 1 ? (
              <span className="kv-sketch-arrow-down" aria-hidden="true">
                {SYM.down}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </figure>
  );
}

/* -------------------------------------------------------------- structure */

function StructureNode({
  node,
  index,
  colorful,
}: {
  node: SketchNode;
  index: number;
  colorful: boolean;
}) {
  const depth = Math.min(2, Math.max(0, node.depth));

  return (
    <div className={`kv-sketch-structure-row depth-${depth}`}>
      {depth > 0 ? <span className="kv-sketch-leader" aria-hidden="true" /> : null}

      <div
        className={[
          "kv-sketch-box",
          colorful ? `kv-ink-${inkFor(index + depth)}` : "kv-ink-blue",
        ].join(" ")}
      >
        <span className="kv-sketch-box-label">{node.label}</span>

        {node.detail ? (
          <span className="kv-sketch-box-detail">{node.detail}</span>
        ) : null}
      </div>
    </div>
  );
}

function SketchStructure({
  nodes,
  title,
  style,
}: {
  nodes: SketchNode[];
  title?: string;
  style: NoteStyle;
}) {
  if (!nodes.length) return null;

  const colorful = style === "Colorful";
  const root = nodes[0];
  const rest = nodes.slice(1);

  return (
    <figure className="kv-sketch kv-sketch-structure">
      {title ? <Scribble>{title}</Scribble> : null}

      <div className="kv-sketch-frame">
        <StructureNode node={root} index={0} colorful={colorful} />

        {rest.length ? (
          <div className="kv-sketch-structure-inner">
            {rest.map((node, index) => (
              <StructureNode
                key={`${node.label}-${index}`}
                node={node}
                index={index + 1}
                colorful={colorful}
              />
            ))}
          </div>
        ) : null}
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ cycle */

function SketchCycle({
  steps,
  title,
}: {
  steps: string[];
  title?: string;
}) {
  if (!steps.length) return null;

  return (
    <figure className="kv-sketch kv-sketch-cycle">
      {title ? <Scribble>{title}</Scribble> : null}

      <ol className="kv-sketch-flow-chain">
        {steps.map((step, index) => (
          <li className="kv-sketch-flow-row" key={`${step}-${index}`}>
            <div className={`kv-sketch-flow-node kv-ink-${inkFor(index)}`}>
              <span className="kv-sketch-flow-text">{step}</span>
            </div>
            {index < steps.length - 1 ? (
              <span className="kv-sketch-arrow-down" aria-hidden="true">
                {SYM.down}
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="kv-sketch-cycle-return">
        <span className="kv-sketch-cycle-hook" aria-hidden="true">
          {"\u21ba"}
        </span>
        <span className="kv-sketch-cycle-text">
          {steps[0]} phir se shuru
        </span>
      </div>
    </figure>
  );
}

/* ----------------------------------------------------------------- formula */

function SketchFormula({
  lines,
  notes,
  title,
  style,
}: {
  lines: string[];
  notes: string[];
  title?: string;
  style: NoteStyle;
}) {
  if (!lines.length) return null;

  const colorful = style === "Colorful";

  return (
    <figure
      className={[
        "kv-sketch",
        "kv-sketch-formula",
        colorful ? "kv-sketch-formula-colorful" : "kv-sketch-formula-simple",
      ].join(" ")}
    >
      {title ? <Scribble>{title}</Scribble> : null}

      <div className="kv-sketch-formula-body">
        {lines.map((line, index) => (
          <MathLine key={`${line}-${index}`} value={line} />
        ))}

        {notes.length ? (
          <div className="kv-sketch-formula-notes">
            {notes.map((note, index) => (
              <div className="kv-sketch-formula-note" key={`${note}-${index}`}>
                <span className="kv-sketch-formula-note-arrow" aria-hidden="true">
                  {SYM.arrow}
                </span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <span className="kv-sketch-underline" aria-hidden="true" />
    </figure>
  );
}

/* --------------------------------------------------------------- dispatch */

export default function StudySketch({
  element,
  style,
}: {
  element: StudyElement;
  style: NoteStyle;
}) {
  if (element.kind === "flowchart") {
    return <SketchFlow steps={element.steps} title={element.title} style={style} />;
  }

  if (element.kind === "diagram") {
    return <SketchStructure nodes={element.nodes} title={element.title} style={style} />;
  }

  if (element.kind === "cycle") {
    return <SketchCycle steps={element.steps} title={element.title} />;
  }

  if (element.kind === "formula") {
    return (
      <SketchFormula
        lines={element.lines}
        notes={element.notes}
        title={element.title}
        style={style}
      />
    );
  }

  return null;
}
