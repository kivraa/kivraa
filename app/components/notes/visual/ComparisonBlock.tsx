"use client";

import type { ReactNode } from "react";

export default function ComparisonBlock({
  children,
}: {
  children?: ReactNode;
}) {
  if (!children) return null;

  return (
    <div className="kivraa-comparison-wrap">
      <div className="kivraa-comparison-label">
        <span aria-hidden="true">↔</span>
        <span>Compare</span>
      </div>

      <div className="kivraa-comparison-scroll">
        <table className="kivraa-comparison-table">
          {children}
        </table>
      </div>
    </div>
  );
}