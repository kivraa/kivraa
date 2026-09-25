"use client";

/*
 * STUDY COMPOSER
 * ==============
 *
 * The composer's only job is to decide WHAT goes on a page and WHERE.
 * It never invents, pads or drops study material:
 *
 *   - every element carries a render-cost estimate ("units"), the same way a
 *     student eyeballs how much room a block needs,
 *   - sections stay intact: a heading is never orphaned from its content,
 *   - page count is driven by the content itself (small topic -> 2-3 pages,
 *     large topic -> 5-7), never by a fixed page count,
 *   - a page becomes a two-column asymmetric spread only when it has enough
 *     material to fill it honestly, otherwise it stays a single column,
 *   - sketches (flowchart / diagram / cycle / formula) are placed full width
 *     where they can breathe, the way a student uses the whole page width
 *     for a drawing,
 *   - a last page that is almost empty is merged back instead of being padded.
 */

import {
  SYM,
  type StudyDocument,
  type StudyElement,
  type StudySection,
} from "./studyElements";

export type PageLayout = "single" | "spread";

export type ComposedSection = StudySection & { units: number };

export type ComposedPage = {
  index: number;
  layout: PageLayout;
  left: ComposedSection[];
  right: ComposedSection[];
  full: StudyElement[];
  units: number;
  capacity: number;
  showTitle: boolean;
};

export type StudyBlock =
  | { type: "section"; number: number; heading: string; elements: StudyElement[]; units: number }
  | { type: "sketch"; element: StudyElement; units: number };

/* --------------------------------------------------------------- capacity */

/*
 * A medium ruled sheet holds roughly this much study material at a readable
 * size. The two columns share the width, so each column gets half.
 */
export const PAGE_UNITS = 44;
const COLUMN_UNITS = 22;

const SKETCH_KINDS = new Set(["flowchart", "diagram", "cycle", "formula"]);

export function isSketch(element: StudyElement) {
  return SKETCH_KINDS.has(element.kind);
}

/* ------------------------------------------------------------------ units */

function lineUnits(text: string) {
  const length = String(text ?? "").length;
  if (length <= 34) return 0.8;
  if (length <= 72) return 1.1;
  if (length <= 108) return 1.4;
  return 1.8;
}

export function elementUnits(element: StudyElement): number {
  switch (element.kind) {
    case "concept":
    case "key-point":
    case "example":
      return element.lines.reduce((total, line) => total + lineUnits(line), 0);
    case "keyword":
      return 1 + (element.rest ? lineUnits(element.rest) : 0);
    case "definition":
      return 1.6 + lineUnits(element.meaning) * 0.5;
    case "bullet":
      return element.items.reduce((total, item) => total + lineUnits(item), 0);
    case "numbered":
      return element.items.length * 1.5;
    case "process":
    case "flowchart":
    case "cycle":
      return element.steps.length * 1.5;
    case "cause-effect":
      return 1.4 + lineUnits(element.effect) * 0.5;
    case "comparison":
      return 2 + lineUnits(element.a) * 0.4 + lineUnits(element.b) * 0.4;
    case "formula":
      return 2.6 + element.notes.length * 0.9;
    case "diagram":
      return 2.4 + element.nodes.length * 0.9;
    case "important":
    case "remember":
    case "exam-tip":
    case "application":
    case "common-confusion":
    case "why":
      return 1 + element.items.reduce((total, item) => total + lineUnits(item), 0) * 0.8;
    default:
      return 1;
  }
}

/* ------------------------------------------------------------------ blocks */

/*
 * A section that is mostly one big sketch is better treated as a sketch block,
 * so it can take the full page width instead of being squeezed into a column.
 */
function sectionToBlocks(section: StudySection): StudyBlock[] {
  const sketches = section.elements.filter(isSketch);
  const rest = section.elements.filter((element) => !isSketch(element));
  const blocks: StudyBlock[] = [];

  const restUnits = rest.reduce((total, element) => total + elementUnits(element), 0);
  const sketchUnits = sketches.reduce((total, element) => total + elementUnits(element), 0);

  if (rest.length) {
    blocks.push({
      type: "section",
      number: section.number,
      heading: section.heading,
      elements: rest,
      units: 1.8 + restUnits,
    });
  }

  if (sketches.length) {
    if (rest.length && restUnits < 6) {
      /* a small section + its sketch read better as one full-width block */
      blocks.push({
        type: "section",
        number: section.number,
        heading: section.heading,
        elements: [...rest, ...sketches],
        units: 1.8 + restUnits + sketchUnits,
      });
    } else {
      for (const element of sketches) {
        blocks.push({ type: "sketch", element, units: elementUnits(element) });
      }
    }
  }

  return blocks;
}

export function buildBlocks(document: StudyDocument): StudyBlock[] {
  return document.sections.flatMap(sectionToBlocks);
}

/* -------------------------------------------------------------- pagination */

function unitsOf(blocks: StudyBlock[]) {
  return blocks.reduce((total, block) => total + block.units, 0);
}

function fill(blocks: StudyBlock[], target: number) {
  const pages: StudyBlock[][] = [];
  let current: StudyBlock[] = [];
  let used = 0;

  for (const block of blocks) {
    const wouldBe = used + block.units;

    if (current.length && wouldBe > target) {
      pages.push(current);
      current = [block];
      used = block.units;
      continue;
    }

    current.push(block);
    used = wouldBe;
  }

  if (current.length) pages.push(current);
  return pages;
}

/*
 * A greedy fill alone can leave the final sheet conspicuously emptier than the
 * rest. When the material divides cleanly, the same number of pages is re-packed
 * to an even share so every sheet carries roughly the same weight.
 *
 * The rebalance is deliberately conservative. It is only accepted when the even
 * target is still a realistic sheet load AND it reproduces exactly the same page
 * count - a smaller target would let one oversized block fragment into pages of
 * its own and make the notebook longer, not fuller. Nothing is ever padded.
 */
export function paginate(blocks: StudyBlock[]): StudyBlock[][] {
  if (!blocks.length) return [];

  const total = unitsOf(blocks);
  const greedy = fill(blocks, PAGE_UNITS);
  const count = greedy.length;

  if (count > 1) {
    const even = total / count;
    if (even >= PAGE_UNITS * 0.6) {
      const evenPages = fill(blocks, even);
      if (evenPages.length === count) {
        return settle(evenPages, even);
      }
    }
  }

  return settle(greedy, PAGE_UNITS);
}

/*
 * Unit weight is a proxy for height, so even a mathematically clean split can
 * end with a thin final sheet. Trailing blocks are walked back from the page
 * before it until the two sheets sit close together.
 *
 * Pairs are handled right to left, so the final sheet is settled first and is
 * never refilled afterwards. Reading order is preserved because a block only
 * ever moves forward by one page.
 */
function levelTail(pages: StudyBlock[][]) {
  for (let i = pages.length - 1; i > 0; i--) {
    const before = pages[i - 1];
    const after = pages[i];
    if (before.length < 2) continue;

    let from = unitsOf(before);
    let to = unitsOf(after);

    while (to < from * 0.82 && before.length > 1) {
      const moved = before[before.length - 1];
      if (to + moved.units > PAGE_UNITS) break;
      before.pop();
      after.push(moved);
      from -= moved.units;
      to += moved.units;
    }
  }

  return pages;
}

/* a starved trailing page is merged back only when its neighbour can absorb it */
function settle(pages: StudyBlock[][], even: number) {
  for (let i = pages.length - 1; i > 0; i--) {
    const units = unitsOf(pages[i]);
    const room = unitsOf(pages[i - 1]) + units;
    if (units < even * 0.55 && room <= PAGE_UNITS) {
      pages[i - 1] = [...pages[i - 1], ...pages[i]];
      pages.splice(i, 1);
    }
  }

  return levelTail(pages.filter((page) => page.length > 0));
}

/* -------------------------------------------------------------- composition */

function splitColumns(sections: StudyBlock[]): {
  left: ComposedSection[];
  right: ComposedSection[];
} {
  const left: ComposedSection[] = [];
  const right: ComposedSection[] = [];
  let leftUnits = 0;
  let rightUnits = 0;

  for (const block of sections) {
    if (block.type !== "section") continue;

    const section: ComposedSection = {
      number: block.number,
      heading: block.heading,
      elements: block.elements,
      units: block.units,
    };

    if (leftUnits <= rightUnits) {
      left.push(section);
      leftUnits += block.units;
      continue;
    }

    right.push(section);
    rightUnits += block.units;
  }

  return { left, right };
}

function composeOne(blocks: StudyBlock[], index: number): ComposedPage {
  const sectionBlocks = blocks.filter(
    (block): block is Extract<StudyBlock, { type: "section" }> => block.type === "section"
  );
  const full = blocks
    .filter((block): block is Extract<StudyBlock, { type: "sketch" }> => block.type === "sketch")
    .map((block) => block.element);

  const textUnits = sectionBlocks.reduce((total, block) => total + block.units, 0);
  const fullUnits = full.reduce((total, element) => total + elementUnits(element), 0);
  const units = textUnits + fullUnits;

  /*
   * Two columns are used only when there is genuinely enough material to
   * fill two honest columns. Otherwise the page stays a single column,
   * which is what a student does with a short topic.
   */
  const enoughForSpread = textUnits >= COLUMN_UNITS * 1.35;
  const layout: PageLayout = enoughForSpread ? "spread" : "single";

  const { left, right } =
    layout === "spread"
      ? splitColumns(sectionBlocks)
      : { left: sectionBlocks.map(toSection), right: [] };

  return {
    index,
    layout,
    left,
    right,
    full,
    units,
    capacity: PAGE_UNITS,
    showTitle: index === 0,
  };
}

function toSection(block: Extract<StudyBlock, { type: "section" }>): ComposedSection {
  return {
    number: block.number,
    heading: block.heading,
    elements: block.elements,
    units: block.units,
  };
}

export function composePages(blocks: StudyBlock[][]): ComposedPage[] {
  return blocks.map((page, index) => composeOne(page, index));
}

/* ------------------------------------------------------------------ arrow */

export const ARROW = SYM.arrow;
