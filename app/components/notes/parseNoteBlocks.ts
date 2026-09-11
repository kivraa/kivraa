import {
  asStringArray,
  type NoteSegment,
  type VisualKind,
} from "./types";

const VISUAL_KINDS: VisualKind[] = [
  "flowchart",
  "diagram",
  "cycle",
  "formula",
  "important",
  "remember",
  "example",
];

function isVisualKind(value: string): value is VisualKind {
  return VISUAL_KINDS.includes(value as VisualKind);
}

function parseMeta(meta: string) {
  const idMatch = meta.match(/id\s*=\s*["']?([^"'\s]+)["']?/i);

  return {
    id: idMatch?.[1]?.trim() || undefined,
  };
}

function cleanVisualLine(line: string) {
  return line
    .trim()
    .replace(/^[-*•]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

function isObviousAsciiJunk(line: string) {
  const value = line.trim();

  if (!value) return true;

  if (/^[┌┐└┘│─━═╔╗╚╝║╠╣╦╩╬]+$/.test(value)) {
    return true;
  }

  if (/^[\s\-_=+<>|\\/.*`~]+$/.test(value)) {
    return true;
  }

  if (/^.{0,80}(-->|==>|->|=>|→{2,}|-{3,}>).{0,80}$/.test(value)) {
    return false;
  }

  return false;
}

function parseBlockBody(body: string) {
  const lines = String(body || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !isObviousAsciiJunk(line));

  let title: string | undefined;
  const items: string[] = [];

  for (const line of lines) {
    const titleMatch = line.match(/^title\s*:\s*(.+)$/i);

    if (titleMatch && !title) {
      title = titleMatch[1].trim();
      continue;
    }

    const cleaned = cleanVisualLine(line);

    if (cleaned) {
      items.push(cleaned);
    }
  }

  return {
    title,
    items: asStringArray(items).slice(0, 12),
  };
}

export function parseNoteBlocks(markdown: string): NoteSegment[] {
  const source = String(markdown || "").replace(/\r/g, "");

  if (!source.trim()) return [];

  const fence =
    /```(flowchart|diagram|cycle|formula|important|remember|example)([^\n]*)\n([\s\S]*?)```/gi;

  const segments: NoteSegment[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fence.exec(source))) {
    const before = source.slice(lastIndex, match.index).trim();

    if (before) {
      segments.push({
        kind: "markdown",
        content: before,
      });
    }

    const kindRaw = (match[1] || "").toLowerCase();

    if (!isVisualKind(kindRaw)) {
      segments.push({
        kind: "markdown",
        content: match[0],
      });

      lastIndex = match.index + match[0].length;
      continue;
    }

    const meta = parseMeta(match[2] || "");
    const parsed = parseBlockBody(match[3] || "");

    if (!parsed.items.length && !parsed.title) {
      lastIndex = match.index + match[0].length;
      continue;
    }

    segments.push({
      kind: kindRaw,
      id: meta.id,
      title: parsed.title,
      items: parsed.items,
    });

    lastIndex = match.index + match[0].length;
  }

  const rest = source.slice(lastIndex).trim();

  if (rest) {
    segments.push({
      kind: "markdown",
      content: rest,
    });
  }

  return segments;
}

export function cleanGeneratedNotes(text: string) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/```\s*(flowchart|diagram|cycle|formula|important|remember|example)/gi, "```$1")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}