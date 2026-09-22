"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import type { NoteStyle } from "../types";
import { VisualShell } from "./shared";

function cleanFormula(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .trim();
}

function cleanMeaning(value: string) {
  return value
    .replace(/^meaning\s*:\s*/i, "")
    .replace(/^where\s*:\s*/i, "")
    .trim();
}

function isLikelyFormula(value: string) {
  return /[=+\-*/^]|\\frac|\\sqrt|\\times|\\rightarrow|[A-Za-z]\s*=/.test(
    value
  );
}

export default function FormulaBlock({
  title,
  items,
  style,
}: {
  title?: string;
  items?: string[];
  style?: NoteStyle;
}) {
  const lines = Array.isArray(items)
    ? items
        .map((item) => String(item ?? "").trim())
        .filter(Boolean)
    : [];

  if (!lines.length) return null;

  const formulaIndex = lines.findIndex(isLikelyFormula);

  const formula =
    formulaIndex >= 0
      ? lines[formulaIndex]
      : lines[0];

  const meaningLines = lines.filter(
    (_, index) => index !== formulaIndex
  );

  const meaningful = meaningLines
    .map(cleanMeaning)
    .filter(Boolean)
    .slice(0, 3);

  const formulaText = cleanFormula(formula);

  const colorful = style === "Colorful";

  return (
    <VisualShell title={title} label="Formula">
      <div
        className={[
          "kivraa-student-formula",
          colorful
            ? "kivraa-student-formula-colorful"
            : "kivraa-student-formula-simple",
        ].join(" ")}
      >
        <div className="kivraa-formula-paper">
          <div className="kivraa-formula-heading">
            <span>FORMULA</span>
          </div>

          <div className="kivraa-formula-main">
            {isLikelyFormula(formulaText) ? (
              <div className="kivraa-formula-math">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {`$$${formulaText}$$`}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="kivraa-formula-plain">
                {formulaText}
              </div>
            )}
          </div>

          {meaningful.length > 0 ? (
            <div className="kivraa-formula-meaning">
              {meaningful.map((line, index) => (
                <div
                  key={`${line}-${index}`}
                  className="kivraa-formula-meaning-line"
                >
                  <span className="kivraa-formula-arrow">
                    →
                  </span>

                  <span>{line}</span>
                </div>
              ))}
            </div>
          ) : null}

          <span
            className="kivraa-formula-doodle"
            aria-hidden="true"
          />
        </div>
      </div>
    </VisualShell>
  );
}