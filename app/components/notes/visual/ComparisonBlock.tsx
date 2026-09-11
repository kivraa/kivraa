"use client";

import type { ReactNode } from "react";

export default function ComparisonBlock({
  children,
}: {
  children?: ReactNode;
}) {
  if (!children) return null;

  return (
    <div className="my-5 overflow-x-auto rounded-[16px] border border-black/[0.08] bg-[#F8FBFF] shadow-[0_6px_18px_rgba(0,0,0,.04)]">
      <table className="w-full min-w-[280px] border-collapse text-left text-[13px] text-[#1F2937]">
        {children}
      </table>
    </div>
  );
}
