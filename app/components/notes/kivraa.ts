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

/*
  Converts one long AI response into actual notebook pages.

  Rules:
  - One Page = 1 revision sheet (distilled, never a wall of text)
  - Other styles = topic-sized: small 2–3, medium 3–4, large up to 5–6
  - Mobile (compact) = the same content, laid out on fixed medium sheets
    (approximately 700-900 chars each), so pages fill comfortably without
    ever needing to scroll internally.
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
    targetPages = Math.min(
      9,
      Math.max(2, Math.ceil(totalChars / 850))
    );
  } else {
    if (totalChars > 5000) targetPages = 4;
    if (totalChars > 7500) targetPages = 5;
    if (totalChars > 10000) targetPages = 6;
    targetPages = Math.min(6, Math.max(2, targetPages));
  }

  const pages: string[] = [];
  let currentBlocks: string[] = [];
  let currentLength = 0;

  const targetChars = Math.ceil(totalChars / targetPages);

  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks[bi];
    const nextLength = currentLength + block.length;

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

  const tinyThreshold = compact ? 420 : 500;

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
