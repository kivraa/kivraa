"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import katex from "katex";
import "katex/dist/katex.min.css";
import { asStringArray } from "../types";

function normalizeFormula(text: string) {
  return String(text || "")
    .replace(/^\s*\$\$([\s\S]*?)\$\$\s*$/g, "$1")
    .replace(/^\s*\$([\s\S]*?)\$\s*$/g, "$1")
    .trim();
}

export default function FormulaBlock({
  title,
  items,
}: {
  title?: string;
  items?: string[];
}) {
  const lines = asStringArray(items);
  if (!lines.length && !title) return null;

  const formula = normalizeFormula(lines[0] || title || "");
  const meaning = lines.slice(1);

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
    <div className="mk-formula my-5 overflow-hidden rounded-[18px] border border-[#F5B700]/45 bg-[#FFF8D9] shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#E8D77A]/50 px-4 py-2.5">
        <span className="rounded-full bg-[#F5B700] px-3 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-black">
          Formula
        </span>

        {title ? (
          <span className="text-right text-xs font-bold text-[#5B4A00]">
            {title}
          </span>
        ) : null}
      </div>

      <div className="px-4 py-5 sm:px-6">
        <div className="overflow-x-auto text-center text-[#142C49]">
          {mathSafe ? (
            <div className="inline-block min-w-0 text-2xl font-black sm:text-3xl">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({ children }) => (
                    <div className="whitespace-nowrap">
                      {children}
                    </div>
                  ),
                }}
              >
                {`$$${formula}$$`}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="formula-plain mx-auto max-w-full text-[19px] font-bold leading-snug sm:text-[22px]">
              {formula}
            </div>
          )}
        </div>

        {meaning.length ? (
          <div className="mx-auto mt-4 max-w-[680px] space-y-1.5 text-center">
            {meaning.map((item, index) => (
              <p
                key={index}
                className="font-[cursive] text-[14px] leading-6 text-[#4B5563]"
              >
                {item}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
