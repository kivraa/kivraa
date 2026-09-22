"use client";

import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import ComparisonBlock from "./visual/ComparisonBlock";
import VisualBlock from "./VisualBlock";

import {
  ExampleBlock,
  ImportantBlock,
  RememberBlock,
} from "./visual/StudyCards";

import {
  asStringArray,
  type NoteStyle,
  type VisualKind,
} from "./types";

function childText(children: ReactNode): string {
  if (children == null || children === false) {
    return "";
  }

  if (
    typeof children === "string" ||
    typeof children === "number"
  ) {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(childText).join("");
  }

  if (
    typeof children === "object" &&
    children &&
    "props" in children
  ) {
    return childText(
      (
        children as {
          props?: {
            children?: ReactNode;
          };
        }
      ).props?.children
    );
  }

  return "";
}

function cleanLabelContent(
  text: string,
  children: ReactNode
) {
  const trimmed = String(text || "").trim();

  const cleaned = trimmed
    .replace(
      /^(important|remember|example)\s*[:\-–]?\s*/i,
      ""
    )
    .trim();

  return cleaned || childText(children);
}

function getVisualKind(
  className?: string
): VisualKind | null {
  if (!className) return null;

  const match =
    /language-(flowchart|diagram|cycle|formula|important|remember|example)/i.exec(
      className
    );

  if (!match?.[1]) return null;

  return match[1].toLowerCase() as VisualKind;
}

function parseVisualCode(
  text: string
) {
  const lines = asStringArray(
    String(text || "")
      .replace(/\r/g, "")
      .split("\n")
  );

  let title: string | undefined;
  const items: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) continue;

    const titleMatch =
      line.match(/^title\s*:\s*(.+)$/i);

    if (titleMatch && !title) {
      title = titleMatch[1].trim();
      continue;
    }

    items.push(line);
  }

  return {
    title,
    items,
  };
}

function renderLabelCard(
  text: string,
  children: ReactNode
) {
  const trimmed = String(text || "").trim();

  if (/^important\b/i.test(trimmed)) {
    return (
      <ImportantBlock
        items={[
          cleanLabelContent(
            trimmed,
            children
          ),
        ]}
      />
    );
  }

  if (/^remember\b/i.test(trimmed)) {
    return (
      <RememberBlock
        items={[
          cleanLabelContent(
            trimmed,
            children
          ),
        ]}
      />
    );
  }

  if (/^example\b/i.test(trimmed)) {
    return (
      <ExampleBlock
        items={[
          cleanLabelContent(
            trimmed,
            children
          ),
        ]}
      />
    );
  }

  return null;
}

export default function NoteMarkdown({
  content,
  style,
}: {
  content: string;
  style: NoteStyle;
}) {
  if (!content?.trim()) {
    return null;
  }

  const compact = style === "One Page";

  return (
    <div
      className={[
        "kivraa-markdown",
        compact
          ? "kivraa-markdown-compact"
          : "kivraa-markdown-normal",
      ].join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          /*
           * =====================================================
           * MAIN TITLE
           * =====================================================
           *
           * One clean handwritten-study-copy heading.
           * No giant yellow web-card.
           */
          h1: ({ children }) => (
            <h1 className="kivraa-student-title">
              {children}
            </h1>
          ),

          /*
           * =====================================================
           * MAJOR SECTION
           * =====================================================
           */
          h2: ({ children }) => (
            <div className="kivraa-student-subtitle">
              <span
                className="kivraa-heading-marker"
                aria-hidden="true"
              >
                ↳
              </span>

              <h2>{children}</h2>
            </div>
          ),

          /*
           * =====================================================
           * SMALL SUBSECTION
           * =====================================================
           */
          h3: ({ children }) => (
            <h3 className="kivraa-student-mini-heading">
              {children}
            </h3>
          ),

          /*
           * =====================================================
           * PARAGRAPH
           * =====================================================
           *
           * Normal study-copy writing should sit directly
           * on the notebook page.
           */
          p: ({ children }) => {
            const text = childText(children);

            const card = renderLabelCard(
              text,
              children
            );

            if (card) {
              return card;
            }

            return (
              <p className="kivraa-student-paragraph">
                {children}
              </p>
            );
          },

          /*
           * =====================================================
           * UNORDERED LIST
           * =====================================================
           */
          ul: ({ children }) => (
            <ul className="kivraa-student-list">
              {children}
            </ul>
          ),

          /*
           * =====================================================
           * NUMBERED LIST
           * =====================================================
           */
          ol: ({ children }) => (
            <ol className="kivraa-student-numbered-list">
              {children}
            </ol>
          ),

          /*
           * =====================================================
           * LIST ITEM
           * =====================================================
           *
           * Arrow is kept subtle and notebook-like.
           */
          li: ({ children }) => (
            <li className="kivraa-student-list-item">
              <span
                className="kivraa-note-arrow"
                aria-hidden="true"
              >
                →
              </span>

              <span className="kivraa-list-content">
                {children}
              </span>
            </li>
          ),

          /*
           * =====================================================
           * IMPORTANT WORD
           * =====================================================
           *
           * Markdown **important term**
           * becomes a visual emphasis, not a card.
           */
          strong: ({ children }) => (
            <strong className="kivraa-note-strong">
              {children}
            </strong>
          ),

          /*
           * =====================================================
           * SECONDARY EMPHASIS
           * =====================================================
           */
          em: ({ children }) => (
            <em className="kivraa-note-em">
              {children}
            </em>
          ),

          /*
           * =====================================================
           * BLOCKQUOTE / MARGIN NOTE
           * =====================================================
           *
           * Useful for:
           * - exam tips
           * - common mistakes
           * - remember cues
           * - side annotations
           */
          blockquote: ({ children }) => {
            const text = childText(children);

            const card = renderLabelCard(
              text,
              children
            );

            if (card) {
              return card;
            }

            return (
              <blockquote className="kivraa-margin-note">
                <span
                  className="kivraa-margin-note-mark"
                  aria-hidden="true"
                >
                  ★
                </span>

                <div className="kivraa-margin-note-content">
                  {children}
                </div>
              </blockquote>
            );
          },

          /*
           * =====================================================
           * CODE / VISUAL BLOCKS
           * =====================================================
           *
           * Visual blocks remain inside the existing
           * KIVRAA visual architecture.
           */
          pre: ({ children }) => (
            <div className="kivraa-note-code-wrapper">
              {children}
            </div>
          ),

          code: ({
            className,
            children,
          }) => {
            const text = String(
              children ?? ""
            ).replace(/\n$/, "");

            const visualKind =
              getVisualKind(className);

            /*
             * FLOWCHART / DIAGRAM / CYCLE /
             * FORMULA / IMPORTANT / REMEMBER / EXAMPLE
             */
            if (visualKind) {
              const parsed =
                parseVisualCode(text);

              return (
                <VisualBlock
                  kind={visualKind}
                  title={parsed.title}
                  items={parsed.items}
                  style={style}
                />
              );
            }

            /*
             * Multiline code-like content.
             * Kept visually restrained.
             */
            if (
              className ||
              text.includes("\n")
            ) {
              return (
                <code className="kivraa-note-code">
                  {text}
                </code>
              );
            }

            /*
             * Inline code.
             */
            return (
              <code className="kivraa-note-inline-code">
                {children}
              </code>
            );
          },

          /*
           * =====================================================
           * SMALL NOTE DIVIDER
           * =====================================================
           *
           * Used only where Markdown provides an HR.
           * It should remain subtle, not become a UI separator.
           */
          hr: () => (
            <div className="kivraa-note-divider">
              <span aria-hidden="true">
                ✦
              </span>
            </div>
          ),

          /*
           * =====================================================
           * COMPARISONS
           * =====================================================
           *
           * Keep the existing ComparisonBlock architecture.
           * CSS controls the notebook appearance.
           */
          table: ({ children }) => (
            <div className="kivraa-comparison-wrap">
              <ComparisonBlock>
                {children}
              </ComparisonBlock>
            </div>
          ),

          thead: ({ children }) => (
            <thead>{children}</thead>
          ),

          tbody: ({ children }) => (
            <tbody>{children}</tbody>
          ),

          tr: ({ children }) => (
            <tr>{children}</tr>
          ),

          th: ({ children }) => (
            <th className="kivraa-comparison-heading">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="kivraa-comparison-cell">
              {children}
            </td>
          ),

          /*
           * =====================================================
           * IMAGES / DIAGRAMS
           * =====================================================
           *
           * If AI or future content provides an actual image,
           * display it as a student's study drawing.
           */
          img: ({ src, alt }) => (
            <figure className="kivraa-student-drawing">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  typeof src === "string"
                    ? src
                    : ""
                }
                alt={
                  alt ||
                  "Study diagram"
                }
              />

              {alt ? (
                <figcaption>
                  {alt}
                </figcaption>
              ) : null}
            </figure>
          ),

          /*
           * =====================================================
           * LINE BREAKS
           * =====================================================
           *
           * Preserve deliberate short note-line breaks.
           */
          br: () => <br />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}