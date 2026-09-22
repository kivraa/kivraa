"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import katex from "katex";
import "katex/dist/katex.min.css";

import { asStringArray } from "../types";
import { VisualShell } from "./shared";

function normalizeFormula(text: string) {
  return String(text || "")
    .replace(/^\s*\$\$([\s\S]*?)\$\$\s*$/g, "$1")
    .replace(/^\s*\$([\s\S]*?)\$\s*$/g, "$1")
    .trim();
}

function cleanMeaning(text: string) {
  return String(text || "")
    .trim()
    .replace(/^[-*•]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

export default function FormulaBlock({
  title,
  items,
}: {
  title?: string;
  items?: string[];
}) {
  const lines = asStringArray(items)
    .map((item) => String(item).trim())
    .filter(Boolean);

  if (!lines.length && !title) {
    return null;
  }

  const formula = normalizeFormula(
    lines[0] || title || ""
  );

  if (!formula) return null;

  const meaning = lines
    .slice(1)
    .map(cleanMeaning)
    .filter(Boolean);

  let mathSafe = true;

  try {
    katex.renderToString(formula, {
      throwOnError: true,
      displayMode: true,
    });
  } catch {
    mathSafe = false;
  }

  return (
    <VisualShell
      title={title}
      label="Formula"
    >
      <div className="kivraa-student-formula">
        <div className="kivraa-formula-paper">
          {title ? (
            <div className="kivraa-formula-heading">
              {title}
            </div>
          ) : null}

          <div className="kivraa-formula-main">
            {mathSafe ? (
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({ children }) => (
                    <div className="kivraa-formula-math">
                      {children}
                    </div>
                  ),
                }}
              >
                {`$$${formula}$$`}
              </ReactMarkdown>
            ) : (
              <div className="kivraa-formula-plain">
                {formula}
              </div>
            )}
          </div>

          {meaning.length ? (
            <div className="kivraa-formula-meaning">
              {meaning.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="kivraa-formula-meaning-line"
                >
                  <span
                    className="kivraa-formula-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>

                  <span>{item}</span>
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