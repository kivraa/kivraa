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
  - One Page = 1 page
  - Other styles = minimum 3, maximum 6
  - Never create empty pages
  - Prefer heading/section boundaries
  - Avoid tiny pages
*/
export function splitNotesIntoPages(
  text: string,
  style: Style
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

  if (totalChars > 5000) targetPages = 4;
  if (totalChars > 7500) targetPages = 5;
  if (totalChars > 10000) targetPages = 6;

  targetPages = Math.min(6, Math.max(3, targetPages));

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

  for (let i = pages.length - 1; i > 0; i--) {
    if (pages[i].length < 500) {
      pages[i - 1] =
        `${pages[i - 1]}\n\n${pages[i]}`.trim();

      pages.splice(i, 1);
    }
  }

  if (pages.length > 6) {
    const merged: string[] = [];

    for (let i = 0; i < pages.length; i++) {
      const targetIndex = Math.min(
        5,
        Math.floor(
          (i * 6) / pages.length
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