"use client";

import { asStringArray } from "../types";

function Annotation({
  label,
  title,
  items,
  variant,
}: {
  label: "Important" | "Remember" | "Example";
  title?: string;
  items?: string[];
  variant: "important" | "remember" | "example";
}) {
  const lines = asStringArray(items)
    .map((item) => String(item).trim())
    .filter(Boolean);

  const body =
    lines.length > 0
      ? lines
      : title
        ? [title]
        : [];

  if (!body.length) return null;

  return (
    <div
      className={[
        "kivraa-study-annotation",
        `kivraa-study-annotation-${variant}`,
      ].join(" ")}
    >
      <div className="kivraa-study-annotation-label">
        <span
          className="kivraa-study-annotation-symbol"
          aria-hidden="true"
        >
          {variant === "important"
            ? "★"
            : variant === "remember"
              ? "↳"
              : "✎"}
        </span>

        <span>{label}</span>
      </div>

      {title && lines.length > 0 ? (
        <div className="kivraa-study-annotation-title">
          {title}
        </div>
      ) : null}

      <div className="kivraa-study-annotation-body">
        {body.map((line, index) => (
          <div
            key={`${line}-${index}`}
            className="kivraa-study-annotation-line"
          >
            {index > 0 ? (
              <span
                className="kivraa-study-annotation-mini-mark"
                aria-hidden="true"
              >
                •
              </span>
            ) : null}

            <span>{line}</span>
          </div>
        ))}
      </div>

      <span
        className="kivraa-study-annotation-stroke"
        aria-hidden="true"
      />
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
    <Annotation
      label="Important"
      title={title}
      items={items}
      variant="important"
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
    <Annotation
      label="Remember"
      title={title}
      items={items}
      variant="remember"
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
    <Annotation
      label="Example"
      title={title}
      items={items}
      variant="example"
    />
  );
}