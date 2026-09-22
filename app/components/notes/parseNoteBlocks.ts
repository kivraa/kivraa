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
  const value = String(meta || "");

  const idMatch =
    value.match(/\bid\s*=\s*["']([^"']+)["']/i) ||
    value.match(/\bid\s*=\s*([^\s]+)/i);

  return {
    id: idMatch?.[1]?.trim() || undefined,
  };
}

function cleanVisualLine(line: string) {
  return String(line || "")
    .trim()
    .replace(/^[-*•]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

function isObviousAsciiJunk(line: string) {
  const value = String(line || "").trim();

  if (!value) return true;

  // Pure box-drawing / decorative ASCII lines
  if (
    /^[┌┐└┘│─━═╔╗╚╝║╠╣╦╩╬╭╮╯╰]+$/.test(value)
  ) {
    return true;
  }

  // Pure separator/decorative characters
  if (
    /^[\s\-_=+<>|/\\~`*.:]+$/.test(value)
  ) {
    return true;
  }

  // Standalone ASCII arrow art is not useful.
  if (
    /^(-->|==>|->|=>|→{2,}|-{3,}>)+$/.test(value)
  ) {
    return true;
  }

  return false;
}

function parseBlockBody(body: string) {
  const rawLines = String(body || "")
    .replace(/\r/g, "")
    .split("\n");

  let title: string | undefined;
  const items: string[] = [];

  for (const rawLine of rawLines) {
    const line = rawLine.trim();

    if (!line) continue;

    if (isObviousAsciiJunk(line)) {
      continue;
    }

    const titleMatch = line.match(
      /^title\s*:\s*(.+)$/i
    );

    if (titleMatch && !title) {
      title = titleMatch[1].trim();
      continue;
    }

    const cleaned = cleanVisualLine(line);

    if (!cleaned) continue;

    items.push(cleaned);
  }

  return {
    title,
    items: asStringArray(items).slice(0, 12),
  };
}

export function parseNoteBlocks(
  markdown: string
): NoteSegment[] {
  const source = String(markdown || "")
    .replace(/\r/g, "")
    .trim();

  if (!source) return [];

  /*
   * Supported blocks:
   *
   * ```flowchart
   * title: ...
   * Step 1
   * Step 2
   * ```
   *
   * ```diagram id="structure"
   * title: ...
   * Part A
   * Part B
   * ```
   *
   * Same for:
   * cycle
   * formula
   * important
   * remember
   * example
   */

  const fence =
    /```(flowchart|diagram|cycle|formula|important|remember|example)([^\n]*)\n([\s\S]*?)```/gi;

  const segments: NoteSegment[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fence.exec(source))) {
    const before = source
      .slice(lastIndex, match.index)
      .trim();

    if (before) {
      segments.push({
        kind: "markdown",
        content: before,
      });
    }

    const kindRaw = String(match[1] || "")
      .toLowerCase()
      .trim();

    if (!isVisualKind(kindRaw)) {
      segments.push({
        kind: "markdown",
        content: match[0],
      });

      lastIndex =
        match.index + match[0].length;

      continue;
    }

    const meta = parseMeta(match[2] || "");

    const parsed = parseBlockBody(
      match[3] || ""
    );

    /*
     * Ignore completely empty visual blocks.
     */
    if (
      !parsed.items.length &&
      !parsed.title
    ) {
      lastIndex =
        match.index + match[0].length;

      continue;
    }

    segments.push({
      kind: kindRaw,
      id: meta.id,
      title: parsed.title,
      items: parsed.items,
    });

    lastIndex =
      match.index + match[0].length;
  }

  /*
   * Everything after the final visual block
   * remains normal Markdown.
   */
  const rest = source
    .slice(lastIndex)
    .trim();

  if (rest) {
    segments.push({
      kind: "markdown",
      content: rest,
    });
  }

  /*
   * If no visual blocks were found,
   * return the entire content as Markdown.
   */
  if (!segments.length) {
    return [
      {
        kind: "markdown",
        content: source,
      },
    ];
  }

  return segments;
}

export function cleanGeneratedNotes(
  text: string
) {
  return String(text || "")
    .replace(/\r/g, "")

    // Normalize malformed fence openings such as:
    // ``` flowchart
    // ```  flowchart
    // ```flowchart
    .replace(
      /```[ \t]*(flowchart|diagram|cycle|formula|important|remember|example)\b/gi,
      "```$1"
    )

    // Remove excessive blank lines
    .replace(/\n{3,}/g, "\n\n")

    // Remove trailing spaces before line breaks
    .replace(/[ \t]+\n/g, "\n")

    .trim();
}