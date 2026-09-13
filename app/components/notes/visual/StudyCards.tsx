"use client";

import { asStringArray } from "../types";

function Card({
  label,
  accent,
  background,
  title,
  items,
}: {
  label: string;
  accent: string;
  background: string;
  title?: string;
  items?: string[];
}) {
  const lines = asStringArray(items).filter(Boolean);
  const body = lines.length ? lines : title ? [title] : [];

  if (!body.length) return null;

  return (
    <div
      className={[
        "mk-study mk-study-" + label.toLowerCase(),
        "my-5 overflow-hidden rounded-[18px] border",
        background,
        "shadow-[0_7px_20px_rgba(17,24,39,.06)]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-2.5">
        <span
          className={[
            "h-2 w-2 rounded-full",
            accent,
          ].join(" ")}
        />

        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#555]">
          {label}
        </span>
      </div>

      <div className="px-4 py-3.5">
        {title && lines.length ? (
          <div className="mb-1.5 text-[13px] font-black leading-5 text-[#171717]">
            {title}
          </div>
        ) : null}

        <div className="space-y-1.5">
          {body.map((line, index) => (
            <p
              key={index}
              className="text-[13px] leading-6 text-[#343434]"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ImportantBlock({
  title,
  items,
}: {
  title?: string;
  items?: string[];
}) {
  return (
    <Card
      label="Important"
      accent="bg-[#F5B700]"
      background="bg-[#FFF9DB] border-[#E7CC57]/70"
      title={title}
      items={items}
    />
  );
}

export function RememberBlock({
  title,
  items,
}: {
  title?: string;
  items?: string[];
}) {
  return (
    <Card
      label="Remember"
      accent="bg-[#39A96B]"
      background="bg-[#ECFAF1] border-[#8AD1A8]/60"
      title={title}
      items={items}
    />
  );
}

export function ExampleBlock({
  title,
  items,
}: {
  title?: string;
  items?: string[];
}) {
  return (
    <Card
      label="Example"
      accent="bg-[#D15C88]"
      background="bg-[#FFF0F5] border-[#E8B2C7]/60"
      title={title}
      items={items}
    />
  );
}