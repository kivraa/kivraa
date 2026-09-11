import type { NoteStyle } from "./types";

function splitMarkdownSections(markdown: string): string[] {
  const lines = String(markdown || "").split("\n");
  const sections: string[] = [];
  let current: string[] = [];
  let inTable = false;
  let inFence = false;

  const flush = () => {
    const text = current.join("\n").trim();
    if (text) sections.push(text);
    current = [];
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
    }

    const isTableRow = /^\s*\|.*\|\s*$/.test(line);
    if (isTableRow) inTable = true;
    if (inTable && !isTableRow && line.trim() !== "") inTable = false;

    const isHeading = /^#{1,3}\s/.test(line);

    if (
      isHeading &&
      current.length > 0 &&
      !inTable &&
      !inFence
    ) {
      flush();
    }

    current.push(line);
  }

  flush();
  return sections;
}

function getAtoms(text: string): string[] {
  const source = String(text || "");
  const fence = /```[a-zA-Z]+[^\n]*\n[\s\S]*?```/g;
  const atoms: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fence.exec(source))) {
    const before = source.slice(lastIndex, match.index).trim();
    if (before) atoms.push(...splitMarkdownSections(before));
    atoms.push(match[0].trim());
    lastIndex = match.index + match[0].length;
  }

  const rest = source.slice(lastIndex).trim();
  if (rest) atoms.push(...splitMarkdownSections(rest));

  return atoms.filter((atom) => atom.trim().length > 0);
}

export function splitNotesIntoPages(text: string, style: NoteStyle) {
  const clean = String(text || "").trim();
  if (!clean) return [];

  if (style === "One Page") {
    return [clean];
  }

  const atoms = getAtoms(clean);
  if (!atoms.length) return [clean];

  const totalChars = clean.length;
  let targetPages = 3;
  if (totalChars > 5000) targetPages = 4;
  if (totalChars > 7500) targetPages = 5;
  if (totalChars > 10000) targetPages = 6;
  targetPages = Math.min(6, Math.max(3, targetPages));

  const pages: string[] = [];
  let currentBlocks: string[] = [];
  let currentLength = 0;
  const targetChars = Math.ceil(totalChars / targetPages);

  for (const block of atoms) {
    const nextLength = currentLength + block.length;

    if (
      currentBlocks.length > 0 &&
      nextLength > targetChars &&
      pages.length < targetPages - 1
    ) {
      pages.push(currentBlocks.join("\n\n").trim());
      currentBlocks = [];
      currentLength = 0;
    }

    currentBlocks.push(block);
    currentLength += block.length;
  }

  if (currentBlocks.length) {
    pages.push(currentBlocks.join("\n\n").trim());
  }

  for (let i = pages.length - 1; i > 0; i--) {
    if ((pages[i] || "").length < 500) {
      pages[i - 1] = `${pages[i - 1]}\n\n${pages[i]}`.trim();
      pages.splice(i, 1);
    }
  }

  if (pages.length > 6) {
    const merged: string[] = [];
    for (let i = 0; i < pages.length; i++) {
      const targetIndex = Math.min(5, Math.floor((i * 6) / pages.length));
      merged[targetIndex] = `${merged[targetIndex] || ""}\n\n${pages[i]}`.trim();
    }
    return merged.filter(Boolean);
  }

  return pages.filter((page) => page.trim().length > 0);
}
