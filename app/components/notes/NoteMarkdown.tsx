"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

import VisualBlock from "./VisualBlock";
import type { NoteStyle } from "./types";

type NoteMarkdownProps = {
  content: string;
  onePage?: boolean;
  style?: NoteStyle;
};

const VISUAL_KINDS = new Set([
  "flowchart",
  "diagram",
  "cycle",
  "formula",
  "important",
  "remember",
  "example",
]);

function getVisualKind(className?: string) {
  if (!className) return null;

  const match = className.match(/language-([a-zA-Z0-9_-]+)/);

  if (!match) return null;

  const kind = match[1].toLowerCase();

  return VISUAL_KINDS.has(kind) ? kind : null;
}

function cleanText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .trim();
}

function parseVisualBody(body: string) {
  const lines = cleanText(body)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let title = "";
  let items = [...lines];

  /*
   * Supports:
   *
   * title: Photosynthesis Process
   * Sunlight
   * Chlorophyll
   * CO2
   * Glucose
   */
  const titleIndex = items.findIndex((line) =>
    /^title\s*:/i.test(line)
  );

  if (titleIndex !== -1) {
    title = items[titleIndex]
      .replace(/^title\s*:/i, "")
      .trim();

    items.splice(titleIndex, 1);
  }

  /*
   * Remove accidental metadata lines which Gemini
   * may sometimes place inside a visual block.
   */
  items = items.filter((item) => {
    const lower = item.toLowerCase();

    return (
      !lower.startsWith("kind:") &&
      !lower.startsWith("style:") &&
      !lower.startsWith("visual:")
    );
  });

  return {
    title: title || undefined,
    items,
  };
}

function MarkdownCodeBlock({
  className,
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  style: NoteStyle;
}) {
  const value = cleanText(String(children ?? ""));
  const kind = getVisualKind(className);

  if (kind) {
    const parsed = parseVisualBody(value);

    return (
      <VisualBlock
        kind={kind}
        title={parsed.title}
        items={parsed.items}
        style={style}
      />
    );
  }

  return (
    <pre className="kivraa-code-block">
      <code>{value}</code>
    </pre>
  );
}

export default function NoteMarkdown({
  content,
  onePage = false,
  style,
}: NoteMarkdownProps) {
  const safeContent = content || "";

  /*
   * VisualBlock already expects the project's NoteStyle type.
   * "simple" is used only as a safe renderer fallback when
   * this component is used without an explicit style.
   */
  const resolvedStyle =
    style ?? ("simple" as NoteStyle);

  return (
    <article
      className={[
        "kivraa-markdown",
        "kivraa-notebook-content",
        onePage ? "kivraa-one-page-content" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="kivraa-note-h1">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="kivraa-note-h2">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="kivraa-note-h3">
              {children}
            </h3>
          ),

          h4: ({ children }) => (
            <h4 className="kivraa-note-h4">
              {children}
            </h4>
          ),

          p: ({ children }) => (
            <p className="kivraa-note-paragraph">
              {children}
            </p>
          ),

          ul: ({ children }) => (
            <ul className="kivraa-note-list">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="kivraa-note-list kivraa-note-numbered-list">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="kivraa-note-list-item">
              {children}
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

          blockquote: ({ children }) => (
            <blockquote className="kivraa-note-blockquote">
              {children}
            </blockquote>
          ),

          hr: () => (
            <div className="kivraa-note-divider" />
          ),

          pre: ({ children }) => {
            if (!React.isValidElement(children)) {
              return <pre>{children}</pre>;
            }

            const childProps = children.props as {
              className?: string;
              children?: React.ReactNode;
            };

            return (
              <MarkdownCodeBlock
                className={childProps.className}
                style={resolvedStyle}
              >
                {childProps.children}
              </MarkdownCodeBlock>
            );
          },

          code: ({
            className,
            children,
            ...props
          }) => {
            const value = String(children ?? "");

            /*
             * Inline code is treated as a study keyword,
             * not as a programming-code box.
             */
            if (!className) {
              return (
                <code
                  className="kivraa-inline-keyword"
                  {...props}
                >
                  {value}
                </code>
              );
            }

            return (
              <code
                className={className}
                {...props}
              >
                {children}
              </code>
            );
          },

          table: ({ children }) => (
            <div className="kivraa-table-wrap">
              <table className="kivraa-note-table">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="kivraa-note-table-head">
              {children}
            </thead>
          ),

          tbody: ({ children }) => (
            <tbody>{children}</tbody>
          ),

          tr: ({ children }) => (
            <tr className="kivraa-note-table-row">
              {children}
            </tr>
          ),

          th: ({ children }) => (
            <th className="kivraa-note-table-cell kivraa-note-table-header">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="kivraa-note-table-cell">
              {children}
            </td>
          ),

          img: ({ src, alt }) => {
            if (!src) return null;

            return (
              <figure className="kivraa-note-image">
                <img
                  src={src}
                  alt={alt || ""}
                  loading="lazy"
                />

                {alt ? (
                  <figcaption>{alt}</figcaption>
                ) : null}
              </figure>
            );
          },

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="kivraa-note-link"
            >
              {children}
            </a>
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </article>
  );
}