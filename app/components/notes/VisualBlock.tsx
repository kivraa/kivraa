"use client";

import type { NoteStyle } from "./types";
import FlowchartBlock from "./visual/FlowchartBlock";
import DiagramBlock from "./visual/DiagramBlock";
import CycleBlock from "./visual/CycleBlock";
import FormulaBlock from "./visual/FormulaBlock";
import {
  ExampleBlock,
  ImportantBlock,
  RememberBlock,
} from "./visual/StudyCards";
import { asStringArray } from "./types";
import NoteErrorBoundary from "./NoteErrorBoundary";

export default function VisualBlock({
  kind,
  title,
  items,
  style,
}: {
  kind: string;
  title?: string;
  items?: unknown;
  style: NoteStyle;
}) {
  const safeItems = asStringArray(items);
  let block = null;

  switch (kind) {
    case "flowchart":
      block = <FlowchartBlock title={title} items={safeItems} style={style} />;
      break;
    case "diagram":
      block = <DiagramBlock title={title} items={safeItems} style={style} />;
      break;
    case "cycle":
      block = <CycleBlock title={title} items={safeItems} style={style} />;
      break;
    case "formula":
      block = <FormulaBlock title={title} items={safeItems} />;
      break;
    case "important":
      block = <ImportantBlock title={title} items={safeItems} />;
      break;
    case "remember":
      block = <RememberBlock title={title} items={safeItems} />;
      break;
    case "example":
      block = <ExampleBlock title={title} items={safeItems} />;
      break;
    default:
      return null;
  }

  return <NoteErrorBoundary>{block}</NoteErrorBoundary>;
}
