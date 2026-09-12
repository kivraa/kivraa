"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type Row = string[];

function parseRow(line: string): Row {
  const cells = String(line ?? "")
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

  while (cells.length && cells[cells.length - 1] === "") cells.pop();
  while (cells.length && cells[0] === "") cells.shift();

  return cells;
}

function InlineCell({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => <span>{children}</span>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export default function ComparisonTable({ rows }: { rows: string[] }) {
  const parsed = rows
    .map(parseRow)
    .filter((cells) => cells.length > 0)
    .filter((cells) => {
      const joined = cells.join("|").replace(/[:\-\s|]/g, "");
      return joined.length > 0;
    });

  if (parsed.length < 2) return null;

  const headers = parsed[0];
  const data = parsed.slice(1);
  const columns = Math.max(...data.map((cells) => cells.length), headers.length);

  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  };

  return (
    <div className="cmp-card">
      <div className="cmp-head" style={gridStyle}>
        {Array.from({ length: columns }, (_, index) => {
          const label = headers[index] ?? "";
          return label ? (
            <div className="cmp-head-cell" key={index}>
              <InlineCell text={label} />
            </div>
          ) : (
            <div className="cmp-head-cell cmp-head-cell-empty" key={index} />
          );
        })}
      </div>

      {data.map((cells, rowIndex) => (
        <div className="cmp-row" style={gridStyle} key={rowIndex}>
          {Array.from({ length: columns }, (_, colIndex) => {
            const value = cells[colIndex];
            const label = headers[colIndex] ?? "";

            if (colIndex === 0) {
              return (
                <div className="cmp-cell cmp-cell-label" key={colIndex}>
                  {value ? <InlineCell text={value} /> : null}
                </div>
              );
            }

            return (
              <div className="cmp-cell" key={colIndex}>
                {label ? (
                  <span className="cmp-celabel">
                    <InlineCell text={label} />
                  </span>
                ) : null}
                {value ? <InlineCell text={value} /> : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}