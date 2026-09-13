export type Style = "Colorful" | "Simple" | "One Page";
export type Language = "English" | "Hinglish" | "Hindi";
export type Purpose = "Understand" | "Exam Prep" | "Revision";

export const quickTopics = [
  "Photosynthesis",
  "Real Numbers",
  "DBMS",
  "Thermodynamics",
  "Data Structures",
];

export const STYLE_OPTIONS: { icon: string; name: Style; desc: string }[] = [
  { icon: "🌈", name: "Colorful", desc: "Visual" },
  { icon: "✦", name: "Simple", desc: "Focused" },
  { icon: "▤", name: "One Page", desc: "Quick" },
];

export const LANGUAGE_OPTIONS: Language[] = ["English", "Hinglish", "Hindi"];

export const PURPOSE_OPTIONS: { icon: string; name: Purpose }[] = [
  { icon: "🧠", name: "Understand" },
  { icon: "🎯", name: "Exam Prep" },
  { icon: "⚡", name: "Revision" },
];

export function cleanGeneratedNotes(text: string) {
  return text
    .replace(/\r/g, "")
    // Repair common malformed markdown tables from AI output.
    .replace(/\|\s*\|---/g, "|\n|---")
    .replace(/\|\|/g, "|")
    .replace(/\n{3,}/g, "\n\n")
    .replace(
      /\b(H2O|CO2|O2|N2|CH4|NH3)\s+\1\b/gi,
      "$1"
    )
    .replace(
      /([A-Za-z0-9²³⁴⁵⁶⁷⁸⁹]+)\s+\1\b/gi,
      "$1"
    )
    .trim();
}

export function readableVisualText(value: string) {
  return String(value || "")
    .replace(/\$\$/g, "")
    .replace(/\$/g, "")
    .replace(/\\text\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\mathrm\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "$1 / $2")
    .replace(/\\times/g, "×")
    .replace(/\\rightarrow/g, "→")
    .replace(/\\to/g, "→")
    .replace(/\\leq/g, "≤")
    .replace(/\\geq/g, "≥")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\cdot/g, "·")
    .replace(/\\%/g, "%")
    .replace(/\{([^{}]*)\}/g, "$1")
    .replace(/_\{([^{}]*)\}/g, "₍$1₎")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function visualItems(kind: string, rawItems: string[]) {
  const result: string[] = [];

  for (const raw of rawItems) {
    const line = readableVisualText(raw);
    if (!line) continue;

    if (kind === "flowchart") {
      const parts = line
        .split(/\s*(?:-->|->|=>|→|➜|➝)\s*/g)
        .map((part) => part.trim())
        .filter((part) => part && !/^[↓↑←→➜➝]+$/.test(part));

      result.push(...parts);
    } else {
      result.push(line);
    }
  }

  return result
    .filter((item, index) => item && result.indexOf(item) === index)
    .slice(0, 10);
}

/*
  Converts one long AI response into actual notebook pages.

  Rules:
  - One Page = 1 revision sheet (distilled, never a wall of text)
  - Other styles = minimum 3, maximum 6 on desktop
  - Mobile (compact) = minimum 5, maximum 9 — medium-sized pages,
    because the phone viewport fits less per page.
  - Never create empty pages
  - Prefer heading/section boundaries
  - Avoid tiny pages
*/
export function splitNotesIntoPages(
  text: string,
  style: Style,
  compact = false
) {
  const clean = text.trim();

  if (!clean) return [];

  if (style === "One Page") {
    return [clean];
  }

  const blocks = clean
    .split(/\n(?=#+\s)|\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 25);

  if (!blocks.length) {
    return [clean];
  }

  const totalChars = clean.length;

  let targetPages = 3;

  if (compact) {
    if (totalChars > 4000) targetPages = 6;
    if (totalChars > 6500) targetPages = 7;
    if (totalChars > 9000) targetPages = 8;
    if (totalChars > 12000) targetPages = 9;
    targetPages = Math.min(9, Math.max(5, targetPages));
  } else {
    if (totalChars > 5000) targetPages = 4;
    if (totalChars > 7500) targetPages = 5;
    if (totalChars > 10000) targetPages = 6;
    targetPages = Math.min(6, Math.max(3, targetPages));
  }

  const pages: string[] = [];
  let currentBlocks: string[] = [];
  let currentLength = 0;

  const targetChars = Math.ceil(
    totalChars / targetPages
  );

  for (const block of blocks) {
    const nextLength =
      currentLength +
      block.length;

    if (
      currentBlocks.length > 0 &&
      nextLength > targetChars &&
      pages.length < targetPages - 1
    ) {
      pages.push(
        currentBlocks.join("\n\n").trim()
      );

      currentBlocks = [];
      currentLength = 0;
    }

    currentBlocks.push(block);
    currentLength += block.length;
  }

  if (currentBlocks.length) {
    pages.push(
      currentBlocks.join("\n\n").trim()
    );
  }

  const tinyThreshold = compact ? 340 : 500;

  for (let i = pages.length - 1; i > 0; i--) {
    if (pages[i].length < tinyThreshold) {
      pages[i - 1] =
        `${pages[i - 1]}\n\n${pages[i]}`.trim();

      pages.splice(i, 1);
    }
  }

  const maxPages = compact ? 9 : 6;

  if (pages.length > maxPages) {
    const merged: string[] = [];

    for (let i = 0; i < pages.length; i++) {
      const targetIndex = Math.min(
        maxPages - 1,
        Math.floor(
          (i * maxPages) / pages.length
        )
      );

      merged[targetIndex] =
        `${merged[targetIndex] || ""}\n\n${pages[i]}`
          .trim();
    }

    return merged.filter(Boolean);
  }

  return pages.filter(
    (page) => page.trim().length > 0
  );
}

/*
  Distills a full note into a last-minute revision sheet for One Page mode.

  Keeps only high-value material:
  - headings
  - list items / short factual lines
  - fenced blocks (formula, important, remember, comparison)
  - short paragraphs

  Drops long prose paragraphs and low-value filler. The result is a
  concise cheat sheet that fits a single mobile viewport.
*/
export function prepareOnePage(markdown: string) {
  const clean = String(markdown ?? "")
    .replace(/\r/g, "")
    .trim();

  if (!clean) return "";

  const maxSheetChars = 4800;
  const longParagraphLimit = 180;
  const shortLineLimit = 130;

  const blocks = clean.split(/\n{2,}/);

  const kept: string[] = [];

  for (const rawBlock of blocks) {
    const block = rawBlock.trim();
    if (!block) continue;

    if (
      kept.reduce((total, b) => total + b.length, 0) >
      maxSheetChars
    ) {
      break;
    }

    const isFence = /^```/.test(block);
    const isHeading = /^#{1,3}\s/.test(block);
    const lines = block.split("\n");

    if (isFence) {
      const lang =
        /^```([a-z0-9-]+)/i.exec(lines[0])?.[1] || "";

      if (/^(formula|important|remember|comparison|flowchart|diagram)$/i.test(lang)) {
        kept.push(block);
      }
      continue;
    }

    if (isHeading) {
      kept.push(block);
      continue;
    }

    const isList =
      lines.length > 0 &&
      lines.every(
        (line) =>
          /^\s*(?:[-*•]|\d+[.)])\s/.test(line) ||
          /^\s*$/.test(line)
      );

    if (isList) {
      if (block.length <= maxSheetChars - 600) {
        kept.push(block);
      }
      continue;
    }

    const allShort = lines.every(
      (line) => line.trim().length <= shortLineLimit
    );

    if (block.length <= longParagraphLimit) {
      kept.push(block);
      continue;
    }

    if (
      allShort &&
      block.length <= maxSheetChars - 600 &&
      lines.length <= 4
    ) {
      kept.push(block);
      continue;
    }
  }

  return kept.join("\n\n").trim();
}