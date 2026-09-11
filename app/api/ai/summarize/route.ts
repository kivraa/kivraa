import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
];

const CLASS_LEVELS = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "College",
];


const TOPIC_STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "for", "in", "on", "with",
  "from", "by", "is", "are", "was", "were", "what", "how", "why",
  "chapter", "topic", "class", "notes", "unit"
]);

function topicWords(topic: string) {
  return String(topic || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(
      (word) =>
        word.length >= 3 &&
        !TOPIC_STOP_WORDS.has(word)
    );
}

function topicMatchesNotes(topic: string, notes: string) {
  const words = topicWords(topic);
  if (!words.length) return true;

  const lowerNotes = String(notes || "").toLowerCase();

  if (words.length === 1) {
    return lowerNotes.includes(words[0]);
  }

  const matches = words.filter((word) =>
    lowerNotes.includes(word)
  );

  return (
    matches.length >=
    Math.max(1, Math.ceil(words.length * 0.4))
  );
}

export async function POST(req: Request) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY missing hai." },
        { status: 500 }
      );
    }

    const body = await req.json();

    const topic = body?.topic || body?.text || body?.prompt;
    const style = body?.style || "Simple";
    const language = body?.language || "English";
    const purpose = body?.purpose || "Understand";
    const classLevel = body?.classLevel || "";

    if (!topic?.trim()) {
      return NextResponse.json(
        { error: "Topic is required." },
        { status: 400 }
      );
    }

    if (!CLASS_LEVELS.includes(classLevel)) {
      return NextResponse.json(
        { error: "Please select your class first." },
        { status: 400 }
      );
    }

    const STYLES = ["Colorful", "Simple", "One Page"];
    const PURPOSES = ["Understand", "Exam Prep", "Revision"];

    const safeStyle = STYLES.includes(style) ? style : "Simple";
    const safePurpose = PURPOSES.includes(purpose)
      ? purpose
      : "Understand";

    const prompt = `
You are KIVRAA, an AI study-notes engine made for Indian students.

Your job is NOT to copy a textbook.
Your job is to make the student genuinely UNDERSTAND the topic and feel:
"Accha! Ab samajh aa gaya."

==================================================
STUDENT SETTINGS — THESE ARE NON-NEGOTIABLE
==================================================

CLASS: ${classLevel}
LANGUAGE: ${language}
LEARNING GOAL: ${safePurpose}
STYLE: ${safeStyle}

These four settings must visibly change the notes.

==================================================
LANGUAGE RULE — VERY IMPORTANT
==================================================

Selected language: ${language}

If LANGUAGE = Hinglish:
- Write the explanations in natural, conversational Indian Hinglish.
- Use simple Hindi + English together, like a good Indian teacher explaining to a student.
- Do NOT write textbook Hindi.
- Do NOT write fully formal English.
- Keep important technical/scientific terms in English when that is clearer.
- The sentence itself should feel conversational.

GOOD Hinglish style:
"Cell ko body ka basic building block samjho. Jaise ghar chhoti-chhoti bricks se banta hai, waise hi living organisms cells se bane hote hain."

BAD:
"Cell is the fundamental structural and functional unit of living organisms."

For Hinglish, the main explanation MUST feel Hinglish throughout the notes, not just a few words.

If LANGUAGE = Hindi:
- Use natural, student-friendly Hindi.
- Keep standard technical terms in English/commonly used scientific terminology where appropriate.
- Avoid overly formal textbook Hindi.

If LANGUAGE = English:
- Use clear student-friendly English.
- Do not sound like a textbook unless technical terminology is necessary.

==================================================
TOPIC — ABSOLUTE TOPIC LOCK
==================================================

REQUESTED TOPIC:
${topic.trim()}

This is the ONLY topic you are allowed to teach.

CRITICAL:
- Do NOT switch to another chapter.
- Do NOT reuse notes from another topic.
- Do NOT answer a related but different chapter.
- Every heading, explanation, example, formula, diagram, flowchart and table must belong to the requested topic.
- If the topic is "electricity", teach electricity — NOT chemical reactions, acids/bases, motion, cells, or any other chapter.

At the very beginning of your response, output this exact marker on its own line:

<!-- KIVRAA_TOPIC: ${topic.trim()} -->

Then immediately start the notes.
Do not explain or mention this marker.

==================================================
LEARNING GOAL — MUST CHANGE THE ACTUAL TEACHING
==================================================

Selected goal: ${safePurpose}

UNDERSTAND:
This is the most important behavior for this mode.
Teach the idea, don't merely list facts.

For each major concept where useful:
1. Explain it simply.
2. Explain WHY it happens / HOW it works.
3. Give an intuitive analogy or everyday connection.
4. Give a small example.
5. Connect it to the next idea.

Use teacher-like phrases naturally when helpful:
"Think of it like..."
"Simple way to remember..."
"Why does this happen?"
"Here's the catch..."
"Imagine..."

Avoid dumping definitions one after another.

EXAM PREP:
Teach the concept clearly, but prioritize what a Class ${classLevel.replace("Class ", "")} student needs for exams:
- definitions
- key concepts
- formulas
- important differences
- classifications
- steps/processes
- diagrams
- terminology
- exam-important facts
- common mistakes/confusions
Keep important information. Do not turn it into a tiny summary.

REVISION:
Make it rapid to recall:
- key facts
- formulas
- relationships
- processes
- important terms
- memory cues
- common confusion
- high-yield points
Keep it compact but meaningful.

==================================================
CLASS ADAPTATION
==================================================

Class 6–8:
- very simple vocabulary
- explain from zero
- familiar daily-life examples
- simple concepts
- simple visuals
- no advanced jargon

Class 9–10:
- school-level depth
- clear conceptual teaching
- correct terminology
- formulas where relevant
- NCERT-aligned concepts where relevant
- exam-important points
- useful diagrams and processes

Class 11–12:
- deeper conceptual understanding
- correct scientific terminology
- formulas and relationships
- derivations only when genuinely useful
- deeper examples and diagrams

College:
- technical depth
- applications
- technical terminology
- formulas
- practical/academic examples
- technical visuals where useful

Never give Class 11/12/College complexity to Class 6–8.
Never oversimplify Class 11–12 or College.

==================================================
STYLE
==================================================

Selected style: ${safeStyle}

COLORFUL:
Premium Kivraa experience.
Use multiple useful visual treatments:
- yellow highlights
- blue/green/pink information cards
- memory cards
- example cards
- exam-tip cards
- formulas
- comparison tables
- diagrams
- flowcharts
- cause → effect relationships
Do not turn every sentence into a box.

SIMPLE:
This is the FREE CORE KIVRAA PRODUCT.
It must still feel premium, polished and genuinely useful.
Do NOT make Simple boring or weak.
Use the handwritten-note feel, yellow highlights for important terms, clean hierarchy, strong explanations, useful examples, and occasional callouts.
Keep colors restrained compared with Colorful.

ONE PAGE:
Exactly one compact revision sheet.
Only high-value information, formulas, relationships, processes, memory cues and compact visuals.
No filler.

==================================================
WOW EFFECT
==================================================

The student should feel that these notes were MADE FOR THEM, not copied from a book.

For every major concept, prefer this mental sequence where appropriate:

CONCEPT → SIMPLE EXPLANATION → WHY/HOW → EXAMPLE/ANALOGY → MEMORY CUE

Do not mechanically repeat this template for every heading.

Use relatable examples for the student's age.
For Class 9, explain like a smart teacher talking to a Class 9 student.

==================================================
VISUAL INTELLIGENCE
==================================================

Do not represent everything as paragraphs.

Definition → short definition
Why/How → short explanation + analogy
Process → clear flowchart
Classification → hierarchy or valid markdown table
Comparison → valid markdown table
Cycle → cycle block
Formula → formula block
Structure → labelled diagram block
Important fact → important block
Memory aid → remember block
Example → example block

FLOWCHARTS MUST BE ACTUALLY UNDERSTANDABLE.
- Use only 3–6 short nodes.
- Put ONE meaningful idea per line.
- NEVER put a standalone arrow line such as ↓ or → between nodes.
- NEVER put multiple steps into one very long node.
- The sequence must tell a story from START to RESULT.
- Do not use vague labels like "Mechanism", "Process", or "Energy" without context.
- If the process is complex, split it into two simple flowcharts.
- Add one short explanation after the flowchart when needed.

Never use ASCII art.
Never use --->, box-drawing characters, or fake diagrams.

FORMULAS / EQUATIONS:
- In formula blocks, use readable plain text or Unicode math such as I = Q / t, V = W / Q, or ΔQ = ΔU + ΔW.
- Do NOT use LaTeX commands such as \frac, \text, $$, or $...$ inside visual blocks.
- Keep one main formula per formula block.

==================================================
VISUAL BLOCK FORMAT
==================================================

FLOWCHART:
\`\`\`flowchart
title: How Photosynthesis Makes Food
Sunlight is captured by chlorophyll
Water + CO₂ are used
Glucose is produced
Oxygen is released
\`\`\`

IMPORTANT:
\`\`\`important
Exam Tip: Chlorophyll captures light energy for photosynthesis.
\`\`\`

REMEMBER:
\`\`\`remember
Think: Plants use light energy to make food.
\`\`\`

EXAMPLE:
\`\`\`example
A green leaf in sunlight makes glucose using water and carbon dioxide.
\`\`\`

FORMULA:
\`\`\`formula
title: First Law of Thermodynamics
ΔQ = ΔU + ΔW
Heat supplied = Change in internal energy + Work done
\`\`\`

DIAGRAM:
\`\`\`diagram id="structure"
title: Chloroplast
Outer membrane
Inner membrane
Grana
Stroma
\`\`\`

CYCLE:
\`\`\`cycle id="cycle"
title: Water Cycle
Evaporation
Condensation
Precipitation
Collection
\`\`\`

IMPORTANT:
Use visual blocks only where they improve learning.
Do not output raw visual syntax outside fenced blocks.

==================================================
TABLES — STRICT FORMAT
==================================================

If you need a comparison, use a NORMAL markdown table.

Example:

| Feature | Plant Cell | Animal Cell |
|---|---|---|
| Cell wall | Present | Absent |
| Chloroplast | Present | Absent |
| Vacuole | Large | Small |

Rules:
- One header row.
- One separator row.
- Same number of columns in every row.
- Do NOT use doubled pipes like ||.
- Do NOT put multiple tables into one line.
- Never write table syntax as prose.

==================================================
FORMATTING
==================================================

- Start directly with the topic.
- No generic introduction.
- No generic conclusion.
- No motivational quotes.
- No filler.
- No repeated information.
- Use short paragraphs (2–4 lines).
- Prefer bullets where appropriate.
- Bold only genuinely important terms.
- Show each important formula ONCE.
- Do not repeat the same fact in different sections unless the repetition is necessary for learning.
- Keep terminology accurate.

==================================================
LENGTH
==================================================

Colorful / Simple:
- small topic: roughly 3 useful pages
- medium topic: 3–4 useful pages
- large topic: 4–6 useful pages
- minimum 3, maximum 6
- never add filler just to increase length

One Page:
- exactly one compact page

==================================================
FINAL QUALITY CHECK BEFORE ANSWERING
==================================================

Before returning the notes, silently check:

1. Does the language match ${language} throughout?
2. Does the teaching style match ${safePurpose}?
3. Is the difficulty correct for ${classLevel}?
4. Does it sound like student notes rather than a textbook?
5. Are WHY/HOW and examples present where useful?
6. Are flowcharts genuinely understandable?
7. Are markdown tables valid?
8. Are formulas shown only once?
9. Is there repeated information?
10. Would a student actually say "ab samajh aa gaya"?

Return ONLY the Markdown notes.
`;

    let lastError = "";

    for (const model of MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: 0.55,
                maxOutputTokens: 6000,
              },
            }),
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          lastError =
            data?.error?.message ||
            `Gemini request failed: ${response.status}`;

          if (response.status === 429) {
            lastError = "Gemini rate limit. Trying another model.";
          }

          continue;
        }

        const parts = data?.candidates?.[0]?.content?.parts;

        const text = Array.isArray(parts)
          ? parts
              .map((part: { text?: string }) => part?.text || "")
              .join("")
              .trim()
          : "";

        if (!text) {
          lastError = "Gemini returned empty notes.";
          continue;
        }

        // HARD TOPIC SAFETY CHECK:
        // Never display a response if the model returned another chapter.
        const expectedMarker =
          `<!-- KIVRAA_TOPIC: ${topic.trim()} -->`;

        const firstMeaningfulLine =
          text
            .split("\n")
            .map((line) => line.trim())
            .find(Boolean) || "";

        if (
          firstMeaningfulLine.toLowerCase() !==
          expectedMarker.toLowerCase()
        ) {
          lastError =
            "AI response did not pass the Kivraa topic lock.";
          continue;
        }

        const notesWithoutMarker = text
          .replace(
            /^\s*<!--\s*KIVRAA_TOPIC:\s*[\s\S]*?-->\s*/i,
            ""
          )
          .trim();

        if (!topicMatchesNotes(topic, notesWithoutMarker)) {
          lastError =
            "AI response appears to be about a different topic.";
          continue;
        }

        return NextResponse.json({
          text: notesWithoutMarker,
          model,
          classLevel,
        });
      } catch (error: any) {
        lastError =
          error?.message || "Gemini request failed.";
      }
    }

    return NextResponse.json(
      {
        error:
          "Gemini abhi busy hai. Thodi der baad dobara try karo.",
        details: lastError,
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("SUMMARIZE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong.",
      },
      { status: 500 }
    );
  }
}
