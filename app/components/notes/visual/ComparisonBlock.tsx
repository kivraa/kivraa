"use client";

import React from "react";

type ComparisonBlockProps = {
  content: string;
};

function parseRows(content: string) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^[-|:\s]+$/.test(line))
    .map((line) =>
      line
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim())
    )
    .filter((row) => row.length >= 2);
}

export default function ComparisonBlock({
  content,
}: ComparisonBlockProps) {
  const rows = parseRows(content);

  if (rows.length < 2) return null;

  const header = rows[0];
  const body = rows.slice(1);

  return (
    <section className="kivraa-comparison-wrap">
      <div className="kivraa-comparison-label">
        QUICK COMPARISON
      </div>

      <div className="kivraa-comparison-scroll">
        <table className="kivraa-comparison-table">
          <thead>
            <tr>
              {header.map((cell, index) => (
                <th key={`${cell}-${index}`}>
                  {cell}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {body.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {header.map((_, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`}>
                    {row[cellIndex] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}