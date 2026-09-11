export type NoteStyle = "Colorful" | "Simple" | "One Page";
export type NoteLanguage = "English" | "Hinglish" | "Hindi";
export type NotePurpose = "Understand" | "Exam Prep" | "Revision";

export const CLASS_LEVELS = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "College",
] as const;

export type ClassLevel = (typeof CLASS_LEVELS)[number];

export type VisualKind =
  | "flowchart"
  | "diagram"
  | "cycle"
  | "formula"
  | "important"
  | "remember"
  | "example";

export type MarkdownSegment = {
  kind: "markdown";
  content: string;
};

export type VisualSegment = {
  kind: VisualKind;
  id?: string;
  title?: string;
  items: string[];
};

export type NoteSegment = MarkdownSegment | VisualSegment;

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : String(item ?? "").trim()))
    .filter(Boolean);
}
