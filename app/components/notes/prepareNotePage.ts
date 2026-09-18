/*
  Rendering-layer cleanup applied to every notebook page (shared by desktop
  and mobile). It never creates different content — it only fixes how
  already-generated markdown is presented:

  1. Converts GFM pipe tables into ` ```comparison ` fences so both renderers
     show a responsive comparison block instead of raw "| ... |" text.
  2. Removes leftover markdown artifacts (stray pipe characters, `|||`,
     orphan delimiter rows) so raw markdown never reaches the screen.
  3. Turns ASCII arrow sequences (--> -> ==> =>) in prose into a clean
     arrow glyph. Content inside ``` fences (formulas, flowcharts, etc.)
     is left untouched.
*/

const ARROW_SEQ = /(?:-{1,}|={1,})>/g;

function arrowClean(value: string) {
  return String(value).replace(ARROW_SEQ, "→");
}

function isDelimiterRow(line: string) {
  const raw = String(line ?? "").trim();
  if (!raw || raw.includes("`")) return false;

  const body = raw.replace(/^\|/, "").replace(/\|$/, "").trim();
  if (!body || !body.includes("-")) return false;

  return /^[\s|:\-]+$/.test(body);
}

function isPipeRow(line: string) {
  const raw = String(line ?? "").trim();
  if (!raw.includes("|")) return false;

  const hasOuter = raw.startsWith("|") || raw.endsWith("|");

  return hasOuter || raw.split("|").length >= 2;
}

function pipeCells(line: string) {
  return String(line ?? "")
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isJunkLine(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return true;

  if (/^[\s|]+$/.test(trimmed)) return true;

  const body = trimmed.replace(/^\|/, "").replace(/\|$/, "").trim();
  if (body && body.includes("-") && /^[\s|:\-]+$/.test(body)) return true;

  return false;
}

export function prepareNotePage(markdown: string) {
  const lines = String(markdown ?? "")
    .replace(/\r/g, "")
    .split("\n");

  const out: string[] = [];
  let inCode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^\s*```/.test(line)) {
      inCode = !inCode;
      out.push(line);
      continue;
    }

    if (inCode) {
      out.push(line);
      continue;
    }

    // Valid pipe table — convert the whole contiguous block to a comparison fence.
    if (
      isPipeRow(line) &&
      i + 1 < lines.length &&
      isDelimiterRow(lines[i + 1])
    ) {
      const rows: string[] = [];
      let j = i;

      while (j < lines.length) {
        const current = lines[j];
        if (/^\s*```/.test(current)) break;
        if (current.trim() === "" && j > i) break;
        if (!isPipeRow(current) && !isDelimiterRow(current)) break;

        if (!isDelimiterRow(current)) {
          rows.push(arrowClean(current.trim()));
        }

        j++;
      }

      if (rows.length >= 2) {
        out.push("```comparison");
        out.push(...rows);
        out.push("```");
      } else {
        const readable = rows
          .map((row) => pipeCells(row).filter(Boolean).join(" — "))
          .filter(Boolean);

        if (readable.length) out.push(readable.join(" . "));
      }

      i = j - 1;
      continue;
    }

    // Arrow cleanup for plain prose.
    let text = arrowClean(line);

    // Leading whitespace on an otherwise-plain line would turn it into an
    // indented code block (raw markdown on the paper). Normalize the block
    // start so generated headings/lists render as text, never as raw "#".
    text = text.trimStart();

    // "#Heading" without a space would render as raw "#" — make it a valid
    // heading so heading syntax never shows up as literal text.
    text = text.replace(/^(#{1,6})(?=\S)/, "$1 ");

    // `# # 1. ...` / `## #### ...` would render the leading marker as raw
    // text inside the heading — collapse repeated markers into one.
    text = text.replace(/^(#{1,6})(?:\s+#)+\s/, "$1 ");

    // Drop leftover markdown artifacts (stray delimiter rows, |||, pure pipes).
    if (isJunkLine(text)) {
      continue;
    }

    // Any remaining pipe characters are artifacts — strip and rejoin.
    if (text.includes("|")) {
      const cells = pipeCells(text).filter(Boolean);
      text = cells.join(" · ");
    }

    if (text.trim()) {
      out.push(text);
    }
  }

  return out.join("\n");
}