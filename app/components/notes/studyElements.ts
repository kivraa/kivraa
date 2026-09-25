"use client";

/*
 * STUDY ELEMENTS - THE TYPED STUDY MODEL
 * ======================================
 *
 * A generated note is never an AI article. Before a single pixel is drawn,
 * the prepared study copy is parsed into typed STUDY ELEMENTS - the short,
 * student-shaped chunks a real student writes on ruled paper:
 *
 *   short-concept / key-point / keyword / numbered-process / definition /
 *   comparison / formula / important / remember / example / exam-tip /
 *   cause-effect / relationship / flowchart / diagram / cycle
 *
 * Visual kinds are handed straight to the existing student-sketch renderers
 * (VisualBlock), so a flowchart stays a compact vertical student flow and a
 * diagram stays a small labelled sketch - never a SaaS box, never a card.
 *
 * Pipeline:
 *   generated content
 *     -> parseStudyElements(content)   (this file: the ONLY parser)
 *     -> StudyElement[]                (typed, short, student-shaped)
 *     -> buildStudyDocument(content)   (the StudyDocument model)
 *     -> StudySections                 (renders the chunks)
 *     -> NotebookPageComposer          (composes the asymmetric spread)
 *     -> NotebookPage                  (the ruled-paper sheet)
 */

import { parseNoteBlocks } from "./parseNoteBlocks";
import {
  asStringArray,
  type NoteStyle,
  type VisualKind,
} from "./types";

export type StudyElementKind =
  | "short-concept"
  | "key-point"
  | "keyword"
  | "numbered-process"
  | "definition"
  | "comparison"
  | "formula"
  | "important"
  | "remember"
  | "example"
  | "exam-tip"
  | "cause-effect"
  | "relationship"
  | "flowchart"
  | "diagram"
  | "cycle";

export type StudyElement =
  | { kind: "short-concept"; lines: string[] }
  | { kind: "key-point"; lines: string[] }
  | { kind: "keyword"; keyword: string; rest?: string }
  | { kind: "numbered-process"; items: string[] }
  | { kind: "definition"; term: string; meaning: string }
  | { kind: "comparison"; a: string; b: string }
  | { kind: "formula"; items: string[] }
  | { kind: "important"; items: string[] }
  | { kind: "remember"; items: string[] }
  | { kind: "example"; items: string[] }
  | { kind: "exam-tip"; items: string[] }
  | { kind: "cause-effect"; cause: string; effect: string }
  | { kind: "relationship"; a: string; b: string }
  | { kind: "flowchart"; items: string[] }
  | { kind: "diagram"; items: string[] }
  | { kind: "cycle"; items: string[] };

export type StudySection = {
  heading: string;
  elements: StudyElement[];
};

export type StudyDocument = {
  topic: string;
  coreIdea: string | null;
  sections: StudySection[];
  style: NoteStyle;
  onePage: boolean;
};

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
  return VISUAL_KINDS.includes(String(value ?? "").toLowerCase() as VisualKind);
}

function cleanLine(value: unknown) {
  return String(value ?? "")
    .replace(/\r/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const SUBSCRIPT_CHARS: Record<string, string> = {
  "0": "\u2080",
  "1": "\u2081",
  "2": "\u2082",
  "3": "\u2083",
  "4": "\u2084",
  "5": "\u2085",
  "6": "\u2086",
  "7": "\u2087",
  "8": "\u2088",
  "9": "\u2089",
  "+": "\u208a",
  "-": "\u208b",
  "(": "\u208d",
  ")": "\u208e",
  a: "\u2090",
  e: "\u2091",
  h: "\u2095",
  i: "\u1d62",
  k: "\u2096",
  l: "\u2097",
  m: "\u2098",
  n: "\u2099",
  o: "\u2092",
  p: "\u209a",
  s: "\u209b",
  t: "\u209c",
  u: "\u1d64",
  x: "\u2093",
};

const SUPERSCRIPT_CHARS: Record<string, string> = {
  "0": "\u2070",
  "1": "\u00b9",
  "2": "\u00b2",
  "3": "\u00b3",
  "4": "\u2074",
  "5": "\u2075",
  "6": "\u2076",
  "7": "\u2077",
  "8": "\u2078",
  "9": "\u2079",
  "+": "\u207a",
  "-": "\u207b",
  "(": "\u207d",
  ")": "\u207e",
  n: "\u207f",
  i: "\u2071",
};

const LATEX_SYMBOLS: Array<[RegExp, string]> = [
  [/\\(?:longrightarrow|rightarrow|to)\b/g, "\u2192"],
  [/\\Leftrightarrow/g, "\u21d4"],
  [/\\leftrightarrow/g, "\u2194"],
  [/\\Rightarrow/g, "\u21d2"],
  [/\\times/g, "\u00d7"],
  [/\\cdot/g, "\u00b7"],
  [/\\pm/g, "\u00b1"],
  [/\\approx/g, "\u2248"],
  [/\\neq?\b/g, "\u2260"],
  [/\\leq?\b/g, "\u2264"],
  [/\\geq?\b/g, "\u2265"],
  [/\\Delta/g, "\u0394"],
  [/\\alpha/g, "\u03b1"],
  [/\\beta/g, "\u03b2"],
  [/\\gamma/g, "\u03b3"],
  [/\\theta/g, "\u03b8"],
  [/\\lambda/g, "\u03bb"],
  [/\\mu/g, "\u03bc"],
  [/\\pi/g, "\u03c0"],
  [/\\sigma/g, "\u03c3"],
  [/\\omega/g, "\u03c9"],
  [/\\circ\b/g, "\u00b0"],
];

function toScript(value: string, table: Record<string, string>) {
  let out = "";

  for (const ch of value) {
    out += table[ch.toLowerCase()] ?? ch;
  }

  return out;
}

function normalizeMath(input: string) {
  let s = String(input ?? "");

  for (let i = 0; i < 3; i++) {
    s = s.replace(
      /\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,
      "$1 / $2"
    );
  }

  s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, "\u221a($1)");

  for (let i = 0; i < 3; i++) {
    s = s.replace(
      /\\(?:text|mathrmmathbf|mathrm|mathbf|mathit|mbox|operatorname|textbf|ce|pu)\s*\{([^{}]*)\}/g,
      "$1"
    );
  }

  for (const [pattern, symbol] of LATEX_SYMBOLS) {
    s = s.replace(pattern, symbol);
  }

  s = s.replace(/_\{([^{}]*)\}/g, (_m, g) => toScript(g, SUBSCRIPT_CHARS));
  s = s.replace(/\^\{([^{}]*)\}/g, (_m, g) => toScript(g, SUPERSCRIPT_CHARS));
  s = s.replace(/_([0-9a-zA-Z+()-])/g, (_m, c) => SUBSCRIPT_CHARS[c.toLowerCase()] ?? c);
  s = s.replace(/\^([0-9a-zA-Z+-])/g, (_m, c) => SUPERSCRIPT_CHARS[c.toLowerCase()] ?? c);

  s = s.replace(/[{}]/g, "");
  s = s.replace(/\\%/g, "%");
  s = s.replace(/\\/g, "");
  s = s.replace(/\$/g, "");

  return s;
}

function readableText(value: unknown) {
  let s = String(value ?? "");

  s = s.replace(/\$([^$]*)\$/g, (_m, inner) => normalizeMath(inner));
  s = normalizeMath(s);

  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/__([^_]+)__/g, "$1");
  s = s.replace(/`([^`]+)`/g, "$1");
  s = s.replace(/\*+/g, "");
  s = s.replace(/\s+/g, " ");

  return s.trim();
}

function stripListMarker(line: string) {
  return String(line ?? "")
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[-*\u2022\u00b7]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

function isBulletLine(line: string) {
  return /^[-*+]\s+\S/.test(String(line ?? ""));
}

function isNumberedLine(line: string) {
  return /^\d+[.)]\s+\S/.test(String(line ?? ""));
}

function isHeadingLine(line: string) {
  return /^#{1,6}\s+\S/.test(String(line ?? ""));
}

function asItems(value: unknown, limit = 12) {
  return asStringArray(value)
    .map(readableText)
    .filter(Boolean)
    .slice(0, limit);
}

/* ---------------------------------------------------------
 *  ANNOTATION LEADS  (small margin annotations)
 * --------------------------------------------------------- */

const ANNOTATION_LEADS: Array<[RegExp, "important" | "remember" | "example" | "exam-tip"]> = [
  [/^(?:important|must know|note carefully)\b/i, "important"],
  [/^(?:remember|yaad rakh[oa]?|note down)\b/i, "remember"],
  [/^(?:example|for example|eg\.?|jaise|udaharan)\b/i, "example"],
  [/^(?:exam tip|exam|board exam|paper me|exam me)\b/i, "exam-tip"],
];

function annotationLead(line: string) {
  for (const [pattern, kind] of ANNOTATION_LEADS) {
    if (pattern.test(line)) {
      return {
        kind,
        text: cleanLine(line.replace(pattern, "").replace(/^[:\-.\s]+/, "")),
      };
    }
  }

  return null;
}

/* ---------------------------------------------------------
 *  RELATIONSHIP + CAUSE / EFFECT
 * --------------------------------------------------------- */

const CAUSE_WORDS = /\b(?:causes?|results? in|leads? to|due to|because of)\b/i;

function relationshipSplit(line: string) {
  const arrow = /^(.*?\S)\s*(?:->|=>|<->|<=>|\u2192|\u21d2)\s*(.+)$/.exec(line);
  const words = /^(.*?\S)\s+(causes?|results? in|leads? to)\s+(.+)$/i.exec(line);

  const match = arrow || words;

  if (!match) return null;

  return {
    a: cleanLine(match[1]).replace(/^[-*+]\s+/, ""),
    b: cleanLine(match[3] ?? match[2]),
  };
}

function isComparisonLine(line: string) {
  return /\b(?:vs\.?|versus|compare[ds]? (?:with|to)|difference between)\b/i.test(
    line
  );
}

/* ---------------------------------------------------------
 *  DEFINITION + KEYWORD
 * --------------------------------------------------------- */

function definitionSplit(line: string) {
  const match = /^(.{2,60}?)\s*[:]\s*(.+)$/.exec(line);

  if (!match) return null;

  const term = cleanLine(match[1]).replace(/^[-*+]\s+/, "");

  if (!/^[A-Za-z\u0900-\u097F]/.test(term)) return null;

  const meaning = cleanLine(match[2]);

  if (!meaning || meaning === term) return null;

  return { term, meaning };
}

function keywordSplit(line: string) {
  const match = /^\*\*([^*\n]{1,60})\*\*\s*(.*)$/.exec(line);

  if (!match) return null;

  const keyword = cleanLine(match[1]);
  const rest = cleanLine(match[2]);

  if (!keyword) return null;

  return rest ? { keyword, rest } : { keyword };
}

/* ---------------------------------------------------------
 *  THE PARSER
 * --------------------------------------------------------- */

function classifySingleLine(
  elements: StudyElement[],
  line: string
) {
  const keyword = keywordSplit(line);

  if (keyword) {
    elements.push({
      kind: "keyword",
      keyword: readableText(keyword.keyword),
      rest: keyword.rest ? readableText(keyword.rest) : undefined,
    });

    return;
  }

  const text = stripListMarker(readableText(line));

  if (!text) return;

  const lead = annotationLead(text);

  if (lead) {
    elements.push(
      lead.kind === "important"
        ? { kind: "important", items: [lead.text] }
        : lead.kind === "remember"
          ? { kind: "remember", items: [lead.text] }
          : lead.kind === "example"
            ? { kind: "example", items: [lead.text] }
            : { kind: "exam-tip", items: [lead.text] }
    );

    return;
  }

  const definition = definitionSplit(text);

  if (definition) {
    elements.push({ kind: "definition", ...definition });
    return;
  }

  const relation = relationshipSplit(text);

  if (relation) {
    if (CAUSE_WORDS.test(text)) {
      elements.push({
        kind: "cause-effect",
        cause: relation.a,
        effect: relation.b,
      });
    } else {
      elements.push({
        kind: "relationship",
        a: relation.a,
        b: relation.b,
      });
    }

    return;
  }

  if (isComparisonLine(text)) {
    const parts = text.split(/\s+(?:vs\.?|versus)\s+/i);

    if (parts.length >= 2) {
      elements.push({
        kind: "comparison",
        a: cleanLine(parts[0]),
        b: cleanLine(parts.slice(1).join(" vs ")),
      });

      return;
    }
  }

  if (text.length > 150) {
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map(cleanLine)
      .filter(Boolean)
      .slice(0, 3);

    if (sentences.length > 1) {
      elements.push({ kind: "short-concept", lines: sentences });
      return;
    }
  }

  elements.push({ kind: "short-concept", lines: [text] });
}

function classifyMarkdownBlock(
  elements: StudyElement[],
  block: string
) {
  const lines = String(block ?? "")
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);

  if (!lines.length) return;

  /* a block that is only a heading becomes a short section head chunk */
  if (lines.length === 1 && isHeadingLine(lines[0])) {
    const text = stripListMarker(readableText(lines[0]));

    if (text) {
      elements.push({ kind: "key-point", lines: [text] });
    }

    return;
  }

  /* bullets -> one compact bullet list chunk */
  if (lines.length >= 2 && lines.every(isBulletLine)) {
    elements.push({
      kind: "key-point",
      lines: lines
        .map((line) => readableText(line.replace(/^[-*+]\s+/, "")))
        .filter(Boolean)
        .slice(0, 6),
    });

    return;
  }

  /* numbered lines -> a real numbered process */
  if (lines.length >= 2 && lines.every(isNumberedLine)) {
    elements.push({
      kind: "numbered-process",
      items: lines
        .map((line) => readableText(line.replace(/^\d+[.)]\s+/, "")))
        .filter(Boolean)
        .slice(0, 8),
    });

    return;
  }

  /* every remaining line is studied on its own, so a paragraph never
     hides a definition, a keyword or a relationship inside a blob */
  for (const line of lines) {
    classifySingleLine(elements, line);
  }
}

export function parseStudyElements(markdown: string): StudyElement[] {
  const source = String(markdown ?? "");

  if (!source.trim()) return [];

  const segments = parseNoteBlocks(source);
  const elements: StudyElement[] = [];

  if (!Array.isArray(segments) || !segments.length) {
    classifyMarkdownBlock(elements, source);
    return elements;
  }

  for (const segment of segments) {
    if (!segment) continue;

    const kind = String(segment.kind ?? "");

    /* visual study element -> handed to the existing sketch renderers */
    if (kind !== "markdown" && isVisualKind(kind)) {
      const items = asItems(
        (segment as unknown as { items?: unknown }).items
      );

      if (!items.length) continue;

      if (kind === "important") {
        elements.push({ kind: "important", items });
        continue;
      }

      if (kind === "remember") {
        elements.push({ kind: "remember", items });
        continue;
      }

      if (kind === "example") {
        elements.push({ kind: "example", items });
        continue;
      }

      if (kind === "formula") {
        elements.push({ kind: "formula", items });
        continue;
      }

      elements.push({ kind: kind as VisualKind, items });
      continue;
    }

    const content = String(
      (segment as unknown as { content?: unknown }).content ?? ""
    ).trim();

    if (!content) continue;

    for (const block of content.split(/\n{2,}/)) {
      const text = String(block).trim();

      if (!text) continue;

      classifyMarkdownBlock(elements, text);
    }
  }

  return elements;
}

/* ---------------------------------------------------------
 *  THE STUDY DOCUMENT MODEL
 * --------------------------------------------------------- */

function pullTopic(source: string) {
  const match =
    /^#{1,6}\s+(.+)$/m.exec(source) ||
    /^(?:topic|chapter|subject)\s*[:]\s*(.+)$/im.exec(source);

  return cleanLine(match?.[1] ?? "")
    .replace(/^[*_`#]+|[*_`]+$/g, "")
    .slice(0, 64);
}

function pullCoreIdea(elements: StudyElement[]) {
  for (const element of elements) {
    if (element.kind === "short-concept") {
      const line = element.lines[0];

      if (line && line.length <= 120) return line;
    }

    if (element.kind === "keyword") {
      return element.rest
        ? `${element.keyword} - ${element.rest}`
        : element.keyword;
    }
  }

  return null;
}

export function buildStudyDocument(
  markdown: string,
  style: NoteStyle
): StudyDocument {
  const source = String(markdown ?? "");
  const elements = parseStudyElements(source);

  return {
    topic: pullTopic(source) || "Study notes",
    coreIdea: pullCoreIdea(elements),
    sections: [{ heading: "Study copy", elements }],
    style,
    onePage: style === "One Page",
  };
}
