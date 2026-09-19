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

import { asStringArray, type NoteStyle, type VisualKind } from "./types";

const hand = "var(--font-kivraa-hand)";

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
      .replace(
        /^(important|remember|example)\s*[:\-–]?\s*/i,
        ""
      )
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
        h1: ({ children }) => (
          <div className="relative isolate mb-4 mt-1 inline-block max-w-full min-w-0 break-words">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[-2px] top-[58%] bottom-[3%] -z-[1] rotate-[-0.5deg] rounded-[3px] bg-[#F5D85B]/80"
            />
            <h1
              className={[
                "font-bold leading-[1.12] text-[#142C49]",
                compact ? "text-xl" : "text-[26px] sm:text-[28px]",
              ].join(" ")}
              style={{ fontFamily: hand }}
            >
              {children}
            </h1>
          </div>
        ),

        h2: ({ children }) => (
          <div
            className={
              compact ? "mb-1.5 mt-4" : "mb-2.5 mt-6 first:mt-1"
            }
          >
            <div className="flex items-end gap-2">
              <span className="mb-[3px] h-2 w-2 shrink-0 rounded-full bg-[#F5B700]" />
              <h2
                className={[
                  "font-bold leading-tight text-[#142C49]",
                  compact ? "text-[15px]" : "text-[19px]",
                ].join(" ")}
                style={{ fontFamily: hand }}
              >
                {children}
              </h2>
            </div>
            <div
              className={
                compact
                  ? "mt-0.5 h-[2.5px] w-8 rounded-full bg-[#F5B700]/70"
                  : "mt-1 h-[3px] w-12 rounded-full bg-[#F5B700]/70"
              }
            />
          </div>
        ),

        h3: ({ children }) => (
          <h3
            className={[
              "mb-1.5 mt-4 font-bold text-[#17314F]",
              compact ? "text-[14px]" : "text-[16.5px]",
            ].join(" ")}
            style={{ fontFamily: hand }}
          >
            <span
              aria-hidden="true"
              className="mr-1 text-[#E7A900]"
            >
              ↳
            </span>
            {children}
          </h3>
        ),

        p: ({ children }) => {
          const text = childText(children);
          const card = cardFromLabel(text, children);

          if (card) return card;

          return (
            <p
              className={[
                "mb-3 leading-[1.65] text-[#26384B]",
                compact ? "text-[12.5px] leading-[1.6]" : "text-[15.5px]",
              ].join(" ")}
            >
              {children}
            </p>
          );
        },

        ul: ({ children }) => (
          <ul
            className={[
              "mb-3.5 ml-5 list-disc space-y-1 leading-[1.6] text-[#26384B]",
              compact ? "text-[12.5px]" : "text-[15px]",
              "marker:text-[#E7A900]",
            ].join(" ")}
          >
            {children}
          </ul>
        ),

        ol: ({ children }) => (
          <ol
            className={[
              "mb-3.5 ml-5 list-decimal space-y-1 leading-[1.6] text-[#26384B]",
              compact ? "text-[12.5px]" : "text-[15px]",
              "marker:font-bold marker:text-[#E7A900]",
            ].join(" ")}
          >
            {children}
          </ol>
        ),

        li: ({ children }) => (
          <li className="pl-1">{children}</li>
        ),

        strong: ({ children }) => (
          <strong className="mk-ink-strong font-bold text-[#132C4B]">
            {children}
          </strong>
        ),

        em: ({ children }) => (
          <em className="font-medium text-[#5B6570]">{children}</em>
        ),

        blockquote: ({ children }) => {
          const text = childText(children);
          const card = cardFromLabel(text, children);

          if (card) return card;

          return (
            <blockquote className="mk-ref-note relative my-4 border-l-[3px] border-dashed border-[#E7B22A] pl-4 pr-2 text-[14.5px] leading-[1.6] text-[#4A4536]">
              {children}
            </blockquote>
          );
        },

        pre: ({ children }) => (
          <div className="my-3">{children}</div>
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
              <code className="block overflow-x-auto rounded-[12px] border border-dashed border-[#D8CFAE] bg-[#F6F0DC]/70 px-4 py-3 font-mono text-[13px] leading-6 text-[#17314F]">
                {text}
              </code>
            );
          }

          return (
            <code className="rounded-[5px] bg-[#EFE7CB]/80 px-1.5 py-0.5 font-mono text-[12.5px] text-[#17314F]">
              {children}
            </code>
          );
        },

        hr: () => (
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#D7CEB3]" />
            <span className="text-[#D1A900]">✦</span>
            <div className="h-px flex-1 bg-[#D7CEB3]" />
          </div>
        ),

        table: ({ children }) => (
          <ComparisonBlock>{children}</ComparisonBlock>
        ),

        thead: ({ children }) => <thead>{children}</thead>,

        tbody: ({ children }) => <tbody>{children}</tbody>,

        tr: ({ children }) => (
          <tr className="border-b border-[#DDD2AE]/80">
            {children}
          </tr>
        ),

        th: ({ children }) => (
          <th className="mk-table-th bg-[#F5D85B]/45 px-3 py-2 text-left font-bold text-[#172D48]">
            {children}
          </th>
        ),

        td: ({ children }) => (
          <td className="px-3 py-2 align-top text-[14px] leading-6 text-[#26384B]">
            {children}
          </td>
        ),

        img: ({ src, alt }) => (
          <div className="my-5 overflow-hidden rounded-[18px] border border-dashed border-[#D8CFAE] bg-transparent p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={typeof src === "string" ? src : ""}
              alt={alt || "Diagram"}
              className="mx-auto max-h-[320px] max-w-full object-contain"
            />
          </div>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}