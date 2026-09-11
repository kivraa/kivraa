"use client";

import FlowchartBlock from "../notes/visual/FlowchartBlock";
import DiagramBlock from "../notes/visual/DiagramBlock";
import CycleBlock from "../notes/visual/CycleBlock";
import FormulaBlock from "../notes/visual/FormulaBlock";
import { asStringArray, type NoteStyle } from "../notes/types";

type VisualProps = {
  type: "flowchart" | "diagram" | "cycle" | "formula";
  title?: string;
  items?: string[];
  style: NoteStyle;
};

export default function NoteVisual({
  type,
  title,
  items,
  style,
}: VisualProps) {
  const safeItems = asStringArray(items);
  if (!safeItems.length && type !== "formula") return null;

  if (type === "formula") {
    return <FormulaBlock title={title} items={safeItems} />;
  }
  if (type === "diagram") {
    return <DiagramBlock title={title} items={safeItems} style={style} />;
  }
  if (type === "cycle") {
    return <CycleBlock title={title} items={safeItems} style={style} />;
  }
  return <FlowchartBlock title={title} items={safeItems} style={style} />;
}
