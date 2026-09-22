"use client";

import React from "react";
import { VisualShell, nodeClass, safeItems } from "./shared";

type AnnotationVariant =
  | "important"
  | "remember"
  | "example";

function Annotation({
  variant,
  title,
  items,
}: {
  variant: AnnotationVariant;
  title?: string;
  items?: string[];
}) {
  const values = safeItems(items, 6);

  if (!values.length && !title) return null;

  const config = {
    important: {
      label: "IMPORTANT",
      symbol: "!",
    },
    remember: {
      label: "REMEMBER",
      symbol: "★",
    },
    example: {
      label: "EXAMPLE",
      symbol: "✎",
    },
  }[variant];

  return (
    <VisualShell
      kind={`annotation-${variant}`}
      label={config.label}
      title={title}
    >
      <div
        className={[
          "kivraa-study-annotation",
          `kivraa-study-annotation-${variant}`,
        ].join(" ")}
      >
        <span
          className="kivraa-study-annotation-symbol"
          aria-hidden="true"
        >
          {config.symbol}
        </span>

        <div className="kivraa-study-annotation-body">
          {title ? (
            <div className="kivraa-study-annotation-title">
              {title}
            </div>
          ) : null}

          {values.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className={[
                "kivraa-study-annotation-line",
                nodeClass(index, true),
              ].join(" ")}
            >
              <span className="kivraa-study-annotation-mark">
                {variant === "example" ? "→" : "•"}
              </span>

              <span>{item}</span>
            </div>
          ))}
        </div>

        <span
          className="kivraa-study-annotation-stroke"
          aria-hidden="true"
        />
      </div>
    </VisualShell>
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
      variant="important"
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
    <Annotation
      variant="remember"
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
    <Annotation
      variant="example"
      title={title}
      items={items}
    />
  );
}

export default Annotation;