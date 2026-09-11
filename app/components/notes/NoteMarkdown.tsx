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
  const colorful = style === "Colorful";
  const compact = style === "One Page";

  if (!content?.trim()) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h1: ({ children }) => (
          <h1
            className={[
              "mb-4 mt-1 font-black tracking-[-0.045em] text-[#171717]",
              compact
                ? "text-xl"
                : "text-[25px] leading-[1.15] sm:text-[29px]",
            ].join(" ")}
          >
            {children}
          </h1>
        ),

        h2: ({ children }) => (
          <h2
            className={[
              "relative mb-3 mt-8 pb-2.5 font-black tracking-[-0.03em] text-[#171717]",
              compact ? "mt-5 text-[15px]" : "text-[18px] sm:text-[20px]",
              colorful
                ? "border-b border-[#F5B700]/30"
                : "border-b border-[#D9D5C8]",
            ].join(" ")}
          >
            {children}
          </h2>
        ),

        h3: ({ children }) => (
          <h3 className="mb-2 mt-5 text-[15px] font-black leading-6 text-[#292929]">
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
                "mb-3.5 leading-[1.75] text-[#3F4650]",
                compact ? "text-[12.5px] leading-[1.65]" : "text-[14.5px]",
              ].join(" ")}
            >
              {children}
            </p>
          );
        },

        ul: ({ children }) => (
          <ul
            className={[
              "mb-4 ml-5 list-disc space-y-1.5 leading-7 text-[#3F4650]",
              compact ? "text-[12.5px]" : "text-[14px]",
              "marker:text-[#F5B700]",
            ].join(" ")}
          >
            {children}
          </ul>
        ),

        ol: ({ children }) => (
          <ol
            className={[
              "mb-4 ml-5 list-decimal space-y-1.5 leading-7 text-[#3F4650]",
              compact ? "text-[12.5px]" : "text-[14px]",
              "marker:font-black marker:text-[#B58A00]",
            ].join(" ")}
          >
            {children}
          </ol>
        ),

        li: ({ children }) => (
          <li className="pl-1">{children}</li>
        ),

        strong: ({ children }) => (
          <strong
            className={[
              "font-black",
              colorful
                ? "rounded-[4px] bg-[#FFF0A8] px-1 text-[#171717]"
                : "text-[#171717]",
            ].join(" ")}
          >
            {children}
          </strong>
        ),

        em: ({ children }) => (
          <em className="font-medium text-[#555]">{children}</em>
        ),

        blockquote: ({ children }) => {
          const text = childText(children);
          const card = cardFromLabel(text, children);

          if (card) return card;

          return (
            <blockquote
              className={[
                "my-5 rounded-[16px] border-l-[4px] px-4 py-3.5 text-[13.5px] leading-6",
                colorful
                  ? "border-[#F5B700] bg-[#FFF8D7] text-[#413600]"
                  : "border-[#C9C4B6] bg-[#F8F7F2] text-[#424242]",
              ].join(" ")}
            >
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
              <code className="block overflow-x-auto rounded-[12px] border border-black/[0.07] bg-[#F5F4EF] px-3 py-2.5 font-mono text-[12px] leading-5 text-[#242424]">
                {text}
              </code>
            );
          }

          return (
            <code
              className={[
                "rounded-[5px] px-1.5 py-0.5 font-mono text-[12.5px]",
                colorful
                  ? "bg-[#FFF1A8] text-[#302700]"
                  : "bg-[#F1EFE8] text-[#252525]",
              ].join(" ")}
            >
              {children}
            </code>
          );
        },

        hr: () => (
          <div className="my-7 h-px bg-gradient-to-r from-transparent via-[#D7D2C5] to-transparent" />
        ),

        table: ({ children }) => (
          <ComparisonBlock>{children}</ComparisonBlock>
        ),

        thead: ({ children }) => <thead>{children}</thead>,

        tbody: ({ children }) => <tbody>{children}</tbody>,

        tr: ({ children }) => (
          <tr className="border-b border-black/[0.06]">
            {children}
          </tr>
        ),

        th: ({ children }) => (
          <th className="bg-[#FFF3C0] px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-[0.05em] text-[#302700]">
            {children}
          </th>
        ),

        td: ({ children }) => (
          <td className="px-3 py-2.5 align-top text-[13px] leading-6 text-[#3F4650]">
            {children}
          </td>
        ),

        img: ({ src, alt }) => (
          <div className="my-5 overflow-hidden rounded-[16px] border border-black/[0.08] bg-[#FCFBF7] p-3">
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