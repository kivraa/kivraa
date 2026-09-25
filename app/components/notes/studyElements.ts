"use client";

/*
 * STUDY ELEMENTS - the typed study model.
 *
 * This is the only place generated content becomes structure. The pipeline is:
 *
 *   generated content
 *     -> parseStudyDocument()      typed study sections + elements
 *     -> shapeDocument()           class / purpose adaptation
 *     -> paginate + compose        intelligent page composition
 *     -> StudyElementView          a typed element becomes a mark on paper
 *     -> NotebookPage              the ruled sheet
 *
 * Every element is a SHORT, student-shaped chunk. Nothing stays a paragraph.
 */

import { parseNoteBlocks } from "./parseNoteBlocks";
import {
  asStringArray,
  type ClassLevel,
  type NotePurpose,
  type NoteStyle,
  type VisualKind,
} from "./types";

/* ---------------------------------------------------------------- symbols */

export const SYM = {
  arrow: "\u2192",
  star: "\u2605",
  down: "\u2193",
  check: "\u2713",
  bullet: "\u2022",
  middot: "\u00b7",
  notEqual: "\u2260",
} as const;

export type StudyElementKind =
  | "concept"
  | "key-point"
  | "keyword"
  | "definition"
  | "bullet"
  | "numbered"
  | "process"
  | "cause-effect"
  | "comparison"
  | "formula"
  | "example"
  | "flowchart"
  | "diagram"
  | "cycle"
  | "important"
  | "remember"
  | "exam-tip"
  | "application"
  | "common-confusion"
  | "why";

export type SketchNode = {
  label: string;
  detail: string;
  depth: number;
};

export type StudyElement =
  | { kind: "concept"; lines: string[] }
  | { kind: "key-point"; lines: string[] }
  | { kind: "keyword"; keyword: string; rest?: string }
  | { kind: "definition"; term: string; meaning: string }
  | { kind: "bullet"; items: string[] }
  | { kind: "numbered"; items: string[] }
  | { kind: "process"; steps: string[] }
  | { kind: "cause-effect"; cause: string; effect: string }
  | { kind: "comparison"; a: string; b: string }
  | { kind: "formula"; lines: string[]; notes: string[]; title?: string }
  | { kind: "example"; lines: string[] }
  | { kind: "flowchart"; steps: string[]; title?: string }
  | { kind: "diagram"; nodes: SketchNode[]; title?: string }
  | { kind: "cycle"; steps: string[]; title?: string }
  | {
      kind:
        | "important"
        | "remember"
        | "exam-tip"
        | "application"
        | "common-confusion"
        | "why";
      items: string[];
    };

export type StudySection = {
  number: number;
  heading: string;
  elements: StudyElement[];
};

export type StudyDocument = {
  topic: string;
  coreIdea: string | null;
  sections: StudySection[];
};

export type StudyContext = {
  style: NoteStyle;
  classLevel: ClassLevel | null;
  purpose: NotePurpose | null;
};

/* ------------------------------------------------------------ text hygiene */

const SUBSCRIPT: Record<string, string> = {
  "0": "\u2080", "1": "\u2081", "2": "\u2082", "3": "\u2083", "4": "\u2084",
  "5": "\u2085", "6": "\u2086", "7": "\u2087", "8": "\u2088", "9": "\u2089",
  "+": "\u208a", "-": "\u208b", a: "\u2090", e: "\u2091", h: "\u2095",
  i: "\u1d62", k: "\u2096", l: "\u2097", m: "\u2098", n: "\u2099",
  o: "\u2092", p: "\u209a", s: "\u209b", t: "\u209c", u: "\u1d64", x: "\u2093",
};

const SUPERSCRIPT: Record<string, string> = {
  "0": "\u2070", "1": "\u00b9", "2": "\u00b2", "3": "\u00b3", "4": "\u2074",
  "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079",
  "+": "\u207a", "-": "\u207b", n: "\u207f", i: "\u2071",
};

const LATEX: Array<[RegExp, string]> = [
  [/\\(?:longrightarrow|rightarrow|to)\b/g, SYM.arrow],
  [/\\Leftrightarrow/g, "\u21d4"],
  [/\\Leftrightarrow?/g, "\u21d4"],
  [/\\Rightarrow/g, "\u21d2"],
  [/\\times/g, "\u00d7"],
  [/\\cdot/g, SYM.middot],
  [/\\pm/g, "\u00b1"],
  [/\\approx/g, "\u2248"],
  [/\\neq?\b/g, "\u2260"],
  [/\\leq?\b/g, "\u2264"],
  [/\\geq?\b/g, "\u2265"],
  [/\\Delta/g, "\u0394"],
  [/\\alpha/g, "\u03b1"], [/\\beta/g, "\u03b2"], [/\\gamma/g, "\u03b3"],
  [/\\theta/g, "\u03b8"], [/\\lambda/g, "\u03bb"], [/\\mu/g, "\u03bc"],
  [/\\pi/g, "\u03c0"], [/\\sigma/g, "\u03c3"], [/\\omega/g, "\u03c9"],
  [/\\circ\b/g, "\u00b0"], [/\\%/g, "%"],
];

function toScript(value: string, table: Record<string, string>) {
  let out = "";
  for (const ch of value) out += table[ch.toLowerCase()] ?? ch;
  return out;
}

function normalizeMath(input: string) {
  let s = String(input ?? "");

  s = s.replace(/-{2,}>\s*\[([^\]]*)\]\s*-{2,}>/g, " \u2192[$1] ");
  s = s.replace(/-{2,}>/g, "\u2192");
  s = s.replace(/(?<!-)->(?!-)/g, "\u2192");
  s = s.replace(/<--?/g, "\u2190");

  for (let i = 0; i < 3; i++) {
    s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "$1 / $2");
  }
  s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, "\u221a($1)");
  for (let i = 0; i < 3; i++) {
    s = s.replace(
      /\\(?:text|mathrm|mathbf|mathit|mbox|operatorname|textbf|ce|pu)\s*\{([^{}]*)\}/g,
      "$1"
    );
  }
  for (const [pattern, symbol] of LATEX) s = s.replace(pattern, symbol);
  s = s.replace(/_\{([^{}]*)\}/g, (_m, g) => toScript(g, SUBSCRIPT));
  s = s.replace(/\^\{([^{}]*)\}/g, (_m, g) => toScript(g, SUPERSCRIPT));
  s = s.replace(/_([0-9a-zA-Z+-])/g, (_m, c) => SUBSCRIPT[c.toLowerCase()] ?? c);
  s = s.replace(/\^([0-9a-zA-Z+-])/g, (_m, c) => SUPERSCRIPT[c.toLowerCase()] ?? c);
  s = s.replace(/[{}]/g, "").replace(/\\/g, "").replace(/\$/g, "");
  return s;
}

function tidy(value: unknown) {
  return String(value ?? "").replace(/\r/g, "").replace(/\s+/g, " ").trim();
}

/* markdown + latex -> readable plain study text */
export function readableText(value: unknown) {
  let s = String(value ?? "");
  s = s.replace(/\$\$?([^$]*)\$\$?/g, (_m, inner) => normalizeMath(inner));
  s = normalizeMath(s);
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  s = s.replace(/`([^`]+)`/g, "$1");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/__([^_]+)__/g, "$1");
  s = s.replace(/\*+/g, "");
  if (s.includes("|")) {
    s = s
      .split(/\n/)
      .map((row) => {
        const cells = row.split("|").map((cell) => cell.trim()).filter(Boolean);
        if (!cells.length) return "";
        if (cells.every((cell) => /^:?-{2,}:?$/.test(cell))) return "";
        return cells.join("  \u2192  ");
      })
      .filter(Boolean)
      .join(" ");
  }
  s = s.replace(/\s+/g, " ");
  return s.trim();
}

function stripMarker(line: string) {
  return String(line ?? "")
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[-*\u2022\u00b7\u25cf]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

const isBullet = (l: string) => /^[-*+\u2022\u25cf]\s+\S/.test(String(l ?? ""));
const isNumbered = (l: string) => /^\d+[.)]\s+\S/.test(String(l ?? ""));
const isHeading = (l: string) => /^#{1,6}\s+\S/.test(String(l ?? ""));

/* ------------------------------------------------------- meaning-based cuts */

/*
 * Break a long sentence where the MEANING changes, not at an arbitrary
 * character count. A study chunk is normally 1-3 lines.
 */
function chunkSentence(text: string, max = 108): string[] {
  const value = tidy(text);
  if (value.length <= max) return [value];

  const sentenceParts = value
    .split(/(?<=[.!?])\s+(?=[A-Z0-9$\\])/)
    .map(tidy)
    .filter(Boolean);

  if (sentenceParts.length > 1) {
    const out: string[] = [];
    for (const part of sentenceParts) {
      out.push(...chunkSentence(part, max));
    }
    return out;
  }

  const clauseParts = value
    .split(
      /(?:,\s+(?=(?:and|but|which|who|that|so|then|while|where|because)\b)|;\s+|\s+-\s+|\s+\u2014\s+|\s+\u2192\s+|\s+\bbecause\b\s+|\s+\bso that\b\s+)/i
    )
    .map(tidy)
    .filter(Boolean);

  if (clauseParts.length > 1) {
    const out: string[] = [];
    for (const part of clauseParts) out.push(...chunkSentence(part, max));
    return out;
  }

  if (value.length <= max * 1.6) return [value];

  const words = value.split(" ");
  const out: string[] = [];
  let line = "";

  for (const word of words) {
    if (line && line.length + word.length + 1 > max) {
      out.push(line);
      line = word;
      continue;
    }
    line = line ? `${line} ${word}` : word;
  }
  if (line) out.push(line);
  return out;
}

/* ------------------------------------------------------------ lead markers */

type LeadKind =
  | "important" | "remember" | "example" | "exam-tip"
  | "application" | "common-confusion" | "why";

const LEADS: Array<[RegExp, LeadKind]> = [
  [/^(?:important|must know|note carefully|key point)\b/i, "important"],
  [/^(?:remember|yaad rakh[oa]?|note down|yaad karo)\b/i, "remember"],
  [/^(?:why\??|kyu|kyun|kyon)\b/i, "why"],
  [/^(?:example|for example|eg\.?|jaise|udaharan)\b/i, "example"],
  [/^(?:common mistake|common confusion|mistake|galti|dhyan do)\b/i, "common-confusion"],
  [/^(?:application|use|uses|apply|real life|uses in)\b/i, "application"],
  [/^(?:exam tip|exam|board exam|paper me|exam me|tip)\b/i, "exam-tip"],
];

function leadOf(text: string) {
  for (const [pattern, kind] of LEADS) {
    if (pattern.test(text)) {
      const rest = tidy(text.replace(pattern, "").replace(/^[:\-.,\s]+/, ""));
      if (rest) return { kind, text: rest };
    }
  }
  return null;
}

/* ------------------------------------------------------------ relationships */

const CAUSE = /\b(?:causes?|results? in|leads? to|due to|because of|is caused by)\b/i;

function relationOf(line: string) {
  const arrow = /^(.*?\S)\s*(?:->|=>|<->|<=>|\u2192|\u21d2)\s*(.+)$/.exec(line);
  const words = /^(.*?\S)\s+(causes?|results? in|leads? to)\s+(.+)$/i.exec(line);
  const match = arrow || words;
  if (!match) return null;
  const a = tidy(stripMarker(match[1]));
  const b = tidy(match[3] ?? match[2]);
  if (!a || !b) return null;
  return { a, b, causal: CAUSE.test(line) };
}

function definitionOf(line: string) {
  const match = /^(.{2,60}?)\s*[:\-]\s+(.+)$/.exec(line);
  if (!match) return null;
  const term = tidy(stripMarker(match[1]));
  if (!/^[A-Za-z\u0900-\u097F]/.test(term)) return null;
  const meaning = tidy(match[2]);
  if (!meaning || meaning === term) return null;
  return { term, meaning };
}

function keywordOf(line: string) {
  const match = /^\*\*([^*\n]{1,60})\*\*\s*(.*)$/.exec(line);
  if (!match) return null;
  const keyword = tidy(match[1]);
  if (!keyword) return null;
  const rest = tidy(match[2]);
  return rest ? { keyword, rest } : { keyword };
}

/* --------------------------------------------------------------- sketch bits */

function sketchNodes(items: string[]) {
  return items.map((raw) => {
    const line = tidy(raw);
    const depth = Math.min(
      3,
      Math.max(0, (line.match(/^[\s>|-]*/)?.[0].match(/[ \t]|>/g)?.length ?? 0) - 1)
    );
    const clean = line.replace(/^[\s>|-]+/, "");
    const split = /^(.+?)\s*(?:\u2192|->|:)\s*(.+)$/.exec(clean);
    if (split) {
      return { label: tidy(split[1]), detail: tidy(split[2]), depth };
    }
    return { label: clean, detail: "", depth };
  });
}

function splitFlow(raw: string) {
  return raw
    .split(/\s*(?:-->|->|=>|\u2192|\u2193)\s*/)
    .map(tidy)
    .filter((part) => part && !/^[\u2192\u2193\u2191\u2190-]+$/.test(part));
}

function isFormulaish(value: string) {
  return /[=+\u00d7\u00b7]|\d\s*[a-zA-Z]|\b(?:is|are)\s+given\b/i.test(value);
}

/* -------------------------------------------------------- single-line parse */

function classifyLine(elements: StudyElement[], rawLine: string) {
  const keyword = keywordOf(rawLine);
  if (keyword) {
    elements.push({
      kind: "keyword",
      keyword: readableText(keyword.keyword),
      rest: keyword.rest ? readableText(keyword.rest) : undefined,
    });
    return;
  }

  const text = stripMarker(readableText(rawLine));
  if (!text) return;

  const lead = leadOf(text);
  if (lead) {
    const lines = chunkSentence(lead.text, 120);
    if (lead.kind === "example") {
      elements.push({ kind: "example", lines });
    } else {
      elements.push({ kind: lead.kind, items: lines });
    }
    return;
  }

  const def = definitionOf(text);
  if (def) {
    elements.push({ kind: "definition", term: def.term, meaning: def.meaning });
    return;
  }

  const rel = relationOf(text);
  if (rel) {
    elements.push(
      rel.causal
        ? { kind: "cause-effect", cause: rel.a, effect: rel.b }
        : { kind: "key-point", lines: [`${rel.a} ${SYM.arrow} ${rel.b}`] }
    );
    return;
  }

  if (/\b(?:vs\.?|versus|difference between|compare[ds]? with)\b/i.test(text)) {
    const parts = text.split(/\s+(?:vs\.?|versus)\s+/i);
    if (parts.length >= 2) {
      elements.push({
        kind: "comparison",
        a: tidy(parts[0]),
        b: tidy(parts.slice(1).join(" vs ")),
      });
      return;
    }
  }

  if (/^(?:given|to find|find|solve|calculate)\b/i.test(text)) {
    elements.push({ kind: "example", lines: chunkSentence(text, 120) });
    return;
  }

  if (text.length > 96) {
    elements.push({ kind: "concept", lines: chunkSentence(text) });
    return;
  }

  elements.push({ kind: "concept", lines: [text] });
}

/* ------------------------------------------------------------- block parse */

function classifyBlock(elements: StudyElement[], block: string) {
  const lines = String(block ?? "")
    .split("\n")
    .map(tidy)
    .filter(Boolean);

  if (!lines.length) return;

  if (lines.length === 1 && isHeading(lines[0])) {
    const text = stripMarker(readableText(lines[0]));
    if (text) elements.push({ kind: "key-point", lines: [text] });
    return;
  }

  if (lines.length >= 2 && lines.every(isBullet)) {
    const items = lines
      .map((line) => readableText(stripMarker(line)))
      .flatMap((line) => chunkSentence(line, 120))
      .filter(Boolean)
      .slice(0, 7);
    if (items.length) elements.push({ kind: "bullet", items });
    return;
  }

  if (lines.length >= 2 && lines.every(isNumbered)) {
    const steps = lines
      .map((line) => readableText(stripMarker(line)))
      .flatMap((line) => chunkSentence(line, 120))
      .filter(Boolean)
      .slice(0, 8);
    if (steps.length) elements.push({ kind: "process", steps });
    return;
  }

  /* a whole block of short standalone facts reads best as a fact list */
  if (lines.length >= 3 && lines.every((line) => line.length <= 74)) {
    const items = lines
      .map((line) => readableText(stripMarker(line)))
      .flatMap((line) => chunkSentence(line, 120))
      .filter(Boolean)
      .slice(0, 7);
    if (items.length) elements.push({ kind: "bullet", items });
    return;
  }

  for (const line of lines) classifyLine(elements, line);
}

/* --------------------------------------------------------- section builder */

type RawSection = { heading: string; body: string[] };

function splitSections(source: string) {
  const lines = String(source ?? "").split("\n");
  const sections: RawSection[] = [];
  let current: RawSection = { heading: "", body: [] };
  let fence = false;
  let topic = "";

  for (const line of lines) {
    if (/^\s*```/.test(line)) fence = !fence;

    const headingMatch = /^(#{1,6})\s+(.+?)\s*$/.exec(line);

    if (!fence && headingMatch) {
      const level = headingMatch[1].length;
      const text = tidy(headingMatch[2]);

      if (level === 1 && !topic) {
        topic = stripMarker(readableText(text));
        continue;
      }

      if (current.body.some((l) => l.trim()) || current.heading) {
        sections.push(current);
      }
      current = { heading: text, body: [] };
      continue;
    }

    current.body.push(line);
  }

  if (current.body.some((l) => l.trim()) || current.heading) {
    sections.push(current);
  }

  return { topic, sections };
}

function parseSectionBody(body: string[]): StudyElement[] {
  const elements: StudyElement[] = [];
  const source = body.join("\n");

  let segments: unknown[] = [];

  try {
    segments = parseNoteBlocks(source) as unknown[];
  } catch {
    segments = [];
  }

  const pushVisual = (kind: VisualKind, items: string[], title?: string) => {
    const clean = items.map(readableText).filter(Boolean);

    if (!clean.length) return;

    if (kind === "flowchart") {
      const steps = clean.flatMap(splitFlow).slice(0, 7);
      if (steps.length >= 2) elements.push({ kind: "flowchart", steps, title });
      return;
    }

    if (kind === "diagram") {
      const nodes = sketchNodes(clean.slice(0, 7));
      if (nodes.length >= 2) elements.push({ kind: "diagram", nodes, title });
      return;
    }

    if (kind === "cycle") {
      const steps = clean.flatMap(splitFlow).slice(0, 6);
      if (steps.length >= 3) elements.push({ kind: "cycle", steps, title });
      return;
    }

    if (kind === "formula") {
      const formulaLines = clean.filter(isFormulaish);
      const notes = clean.filter((line) => !isFormulaish(line));
      elements.push({
        kind: "formula",
        lines: (formulaLines.length ? formulaLines : clean.slice(0, 1)).slice(0, 3),
        notes: notes.slice(0, 4),
      });
      return;
    }

    if (kind === "example") {
      elements.push({ kind: "example", lines: clean.slice(0, 5) });
      return;
    }

    if (kind === "important" || kind === "remember") {
      elements.push({ kind, items: clean.slice(0, 5) });
    }
  };

  if (!Array.isArray(segments) || !segments.length) {
    for (const block of source.split(/\n{2,}/)) classifyBlock(elements, block);
    return elements;
  }

  for (const segment of segments) {
    if (!segment) continue;

    const kind = String((segment as { kind?: string }).kind ?? "");
    const title = (segment as { title?: string }).title
      ? readableText((segment as { title?: string }).title)
      : undefined;
    const items = asStringArray((segment as { items?: unknown }).items);

    if (kind && kind !== "markdown") {
      pushVisual(kind as VisualKind, items, title);
      continue;
    }

    const content = String((segment as { content?: string }).content ?? "").trim();
    if (!content) continue;

    for (const block of content.split(/\n{2,}/)) classifyBlock(elements, block);
  }

  return elements;
}

function pullCoreIdea(elements: StudyElement[]): string | null {
  const cap = (value: string) => {
    const text = String(value || "").trim();
    if (text.length <= 150) return text;
    const cut = text.slice(0, 147).replace(/\s+\S*$/, "");
    return `${cut.trimEnd()}\u2026`;
  };

  for (const element of elements) {
    if (element.kind === "concept" && element.lines[0]?.length <= 130) {
      return element.lines[0];
    }
    if (element.kind === "definition") {
      return cap(`${element.term}: ${element.meaning}`);
    }
    if (element.kind === "keyword" && element.rest) {
      return cap(`${element.keyword} - ${element.rest}`);
    }
  }
  return null;
}

/* ------------------------------------------------------------- entry point */

export function parseStudyDocument(
  markdown: string,
  fallbackTopic?: string
): StudyDocument {
  const source = String(markdown ?? "");
  const { topic, sections: raw } = splitSections(source);

  const usable = raw
    .map((section) => ({
      heading: stripMarker(readableText(section.heading)),
      elements: parseSectionBody(section.body),
    }))
    .filter((section) => section.elements.length > 0);

  if (!usable.length) {
    const elements = parseSectionBody(source.split("\n"));
    if (!elements.length) {
      return { topic: fallbackTopic || topic || "Study notes", coreIdea: null, sections: [] };
    }
    return {
      topic: fallbackTopic || topic || "Study notes",
      coreIdea: pullCoreIdea(elements),
      sections: [{ number: 1, heading: "Core idea", elements }],
    };
  }

  const elements = usable.flatMap((section) => section.elements);

  return {
    topic: fallbackTopic || topic || "Study notes",
    coreIdea: pullCoreIdea(elements),
    sections: usable.map((section, index) => ({
      number: index + 1,
      heading: section.heading || `Section ${index + 1}`,
      elements: section.elements,
    })),
  };
}

/* ------------------------------------------- class / purpose adaptation */

const PURPOSE_ORDER: Record<string, StudyElementKind[]> = {
  understand: [
    "concept", "definition", "keyword", "cause-effect", "example",
    "application", "why", "process", "bullet", "flowchart", "diagram",
    "cycle", "formula", "comparison", "important", "exam-tip", "remember",
    "common-confusion", "key-point", "numbered",
  ],
  exam: [
    "definition", "comparison", "process", "formula", "exam-tip",
    "common-confusion", "important", "keyword", "cause-effect", "bullet",
    "numbered", "diagram", "cycle", "flowchart", "concept", "application",
    "example", "why", "remember", "key-point",
  ],
  revision: [
    "keyword", "formula", "definition", "remember", "important",
    "process", "comparison", "key-point", "cause-effect", "bullet",
    "numbered", "flowchart", "cycle", "diagram", "exam-tip",
    "common-confusion", "concept", "example", "application", "why",
  ],
};

function purposeRank(purpose: NotePurpose | null) {
  const key =
    purpose === "Exam Prep" ? "exam" : purpose === "Revision" ? "revision" : "understand";
  return PURPOSE_ORDER[key];
}

function classChunkLimit(classLevel: ClassLevel | null) {
  if (!classLevel) return 108;
  if (classLevel === "College" || classLevel === "Class 11" || classLevel === "Class 12") {
    return 132;
  }
  if (classLevel === "Class 6" || classLevel === "Class 7") return 74;
  return 96;
}

/*
 * Purpose decides what is worth keeping; class level decides how tightly the
 * lines are cut. Content is never invented and never padded.
 */
export function shapeDocument(
  document: StudyDocument,
  context: StudyContext
): StudyDocument {
  const rank = purposeRank(context.purpose);
  const limit = classChunkLimit(context.classLevel);
  const onePage = context.style === "One Page";
  const simple = context.style === "Simple";

  const shapeElement = (element: StudyElement): StudyElement => {
    if (element.kind === "concept" || element.kind === "key-point" || element.kind === "example") {
      const lines = element.lines.flatMap((line) =>
        limit === 108 ? [line] : chunkSentence(line, limit)
      );
      return { ...element, lines } as StudyElement;
    }

    if (
      element.kind === "bullet" || element.kind === "numbered" ||
      element.kind === "important" || element.kind === "remember" ||
      element.kind === "exam-tip" || element.kind === "application" ||
      element.kind === "common-confusion" || element.kind === "why"
    ) {
      const items = element.items
        .flatMap((item) => (limit === 108 ? [item] : chunkSentence(item, limit)))
        .slice(0, simple ? 3 : 5);
      return { ...element, items } as StudyElement;
    }

    if (element.kind === "process" || element.kind === "flowchart" || element.kind === "cycle") {
      const steps = element.steps.slice(0, simple ? 4 : 6);
      return { ...element, steps } as StudyElement;
    }

    if (element.kind === "formula") {
      return {
        ...element,
        lines: element.lines.slice(0, 2),
        notes: element.notes.slice(0, simple ? 2 : 4),
      };
    }

    return element;
  };

  const sections = document.sections
    .map((section) => {
      const shaped = section.elements
        .map(shapeElement)
        .filter(Boolean)
        .sort((a, b) => {
          const ai = rank.indexOf(a.kind);
          const bi = rank.indexOf(b.kind);
          return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
        });

      const kept = onePage ? shaped.slice(0, 4) : shaped;
      const elements = onePage
        ? kept.flatMap((element) => {
            if (element.kind === "flowchart" || element.kind === "cycle") return [];
            if (element.kind === "diagram") return [{ ...element, nodes: element.nodes.slice(0, 4) } as StudyElement];
            return [element];
          })
        : kept;

      return { ...section, elements };
    })
    .filter((section) => section.elements.length > 0);

  return { ...document, sections };
}
