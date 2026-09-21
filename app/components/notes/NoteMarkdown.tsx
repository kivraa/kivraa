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
  if (children == null || children === false) return "";

  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(childText).join("");
  }

  if (typeof children === "object" && children && "props" in children) {
    return childText(
      (children as { props?: { children?: ReactNode } }).props?.children
    );
  }

  return "";
}

function cardFromLabel(text: string, children: ReactNode) {
  const trimmed = text.trim();

  const content =
    trimmed
      .replace(/^(important|remember|example)\s*[:\-–]?\s*/i, "")
      .trim() || childText(children);

  if (/^important\b/i.test(trimmed)) {
    return <ImportantBlock items={[content]} />;
  }

  if (/^remember\b/i.test(trimmed)) {
    return <RememberBlock items={[content]} />;
  }

  if (/^example\b/i.test(trimmed)) {
    return <ExampleBlock items={[content]} />;
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
  const compact = style === "One Page";

  if (!content?.trim()) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        /*
         * IMPORTANT:
         * No Kalam.
         * No forced handwritten Google font.
         * Typography is controlled by the note stylesheet so the
         * previous Kivraa typography can be restored globally.
         */

        h1: ({ children }) => (
          <div className="kivraa-student-title">
            <h1>{children}</h1>
          </div>
        ),

        h2: ({ children }) => (
          <div className="kivraa-student-subtitle">
            <span className="kivraa-heading-marker" aria-hidden="true">
              ↳
            </span>

            <h2>{children}</h2>
          </div>
        ),

        h3: ({ children }) => (
          <h3 className="kivraa-student-mini-heading">
            {children}
          </h3>
        ),

        p: ({ children }) => {
          const text = childText(children);
          const card = cardFromLabel(text, children);

          if (card) return card;

          return (
            <p className="kivraa-student-paragraph">
              {children}
            </p>
          );
        },

        ul: ({ children }) => (
          <ul className="kivraa-student-list">
            {children}
          </ul>
        ),

        ol: ({ children }) => (
          <ol className="kivraa-student-numbered-list">
            {children}
          </ol>
        ),

        li: ({ children }) => (
          <li className="kivraa-student-list-item">
            <span className="kivraa-note-arrow" aria-hidden="true">
              →
            </span>
            <span>{children}</span>
          </li>
        ),

        strong: ({ children }) => (
          <strong className="kivraa-note-strong">
            {children}
          </strong>
        ),

        em: ({ children }) => (
          <em className="kivraa-note-em">
            {children}
          </em>
        ),

        blockquote: ({ children }) => {
          const text = childText(children);
          const card = cardFromLabel(text, children);

          if (card) return card;

          return (
            <blockquote className="kivraa-margin-note">
              <span
                className="kivraa-margin-note-mark"
                aria-hidden="true"
              >
                ★
              </span>

              <div>{children}</div>
            </blockquote>
          );
        },

        pre: ({ children }) => (
          <div className="kivraa-note-code-wrapper">
            {children}
          </div>
        ),

        code: ({ className, children }) => {
          const lang =
            /language-([a-z0-9-]+)/i.exec(className || "")?.[1]?.toLowerCase();

          const text = String(children ?? "").replace(/\n$/, "");

          const visualKinds = [
            "flowchart",
            "diagram",
            "cycle",
            "formula",
            "important",
            "remember",
            "example",
          ];

          /*
           * Visual blocks remain part of the existing architecture.
           * They are NOT converted into generic cards here.
           */
          if (lang && visualKinds.includes(lang)) {
            const lines = asStringArray(text.split("\n"));

            let title: string | undefined;
            const items: string[] = [];

            for (const line of lines) {
              const titleMatch = line.match(/^title\s*:\s*(.+)$/i);

              if (titleMatch && !title) {
                title = titleMatch[1].trim();
              } else if (line.trim()) {
                items.push(line.trim());
              }
            }

            return (
              <VisualBlock
                kind={lang as VisualKind}
                title={title}
                items={items}
                style={style}
              />
            );
          }

          if (className || text.includes("\n")) {
            return (
              <code className="kivraa-note-code">
                {text}
              </code>
            );
          }

          return (
            <code className="kivraa-note-inline-code">
              {children}
            </code>
          );
        },

        hr: () => (
          <div className="kivraa-note-divider">
            <span aria-hidden="true">✦</span>
          </div>
        ),

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

        img: ({ src, alt }) => (
          <figure className="kivraa-student-drawing">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={typeof src === "string" ? src : ""}
              alt={alt || "Study diagram"}
            />
            {alt ? (
              <figcaption>{alt}</figcaption>
            ) : null}
          </figure>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}