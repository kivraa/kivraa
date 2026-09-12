"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { CLASS_LEVELS, asStringArray, type ClassLevel, type VisualKind } from "../notes/types";
import VisualBlock from "../notes/VisualBlock";
import MobileHero from "./MobileHero";

type Style = "Colorful" | "Simple" | "One Page";
type Language = "English" | "Hinglish" | "Hindi";
type Purpose = "Understand" | "Exam Prep" | "Revision";

const quickTopics = [
  "Photosynthesis",
  "Real Numbers",
  "DBMS",
  "Thermodynamics",
  "Data Structures",
];

function cleanGeneratedNotes(text: string) {
  return text
    .replace(/\r/g, "")
    // Repair common malformed markdown tables from AI output.
    .replace(/\|\s*\|---/g, "|\n|---")
    .replace(/\|\|/g, "|")
    .replace(/\n{3,}/g, "\n\n")
    .replace(
      /\b(H2O|CO2|O2|N2|CH4|NH3)\s+\1\b/gi,
      "$1"
    )
    .replace(
      /([A-Za-z0-9²³⁴⁵⁶⁷⁸⁹]+)\s+\1\b/gi,
      "$1"
    )
    .trim();
}

function readableVisualText(value: string) {
  return String(value || "")
    .replace(/\$\$/g, "")
    .replace(/\$/g, "")
    .replace(/\\text\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\mathrm\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "$1 / $2")
    .replace(/\\times/g, "×")
    .replace(/\\rightarrow/g, "→")
    .replace(/\\to/g, "→")
    .replace(/\\leq/g, "≤")
    .replace(/\\geq/g, "≥")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\cdot/g, "·")
    .replace(/\\%/g, "%")
    .replace(/\{([^{}]*)\}/g, "$1")
    .replace(/_\{([^{}]*)\}/g, "₍$1₎")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function visualItems(kind: string, rawItems: string[]) {
  const result: string[] = [];

  for (const raw of rawItems) {
    const line = readableVisualText(raw);
    if (!line) continue;

    if (kind === "flowchart") {
      const parts = line
        .split(/\s*(?:-->|->|=>|→|➜|➝)\s*/g)
        .map((part) => part.trim())
        .filter((part) => part && !/^[↓↑←→➜➝]+$/.test(part));

      result.push(...parts);
    } else {
      result.push(line);
    }
  }

  return result
    .filter((item, index) => item && result.indexOf(item) === index)
    .slice(0, 10);
}

/*
  Converts one long AI response into actual notebook pages.

  Rules:
  - One Page = 1 page
  - Other styles = minimum 3, maximum 6
  - Never create empty pages
  - Prefer heading/section boundaries
  - Avoid tiny pages
*/
function splitNotesIntoPages(
  text: string,
  style: Style
) {
  const clean = text.trim();

  if (!clean) return [];

  if (style === "One Page") {
    return [clean];
  }

  const blocks = clean
    .split(/\n(?=#+\s)|\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 25);

  if (!blocks.length) {
    return [clean];
  }

  /*
    Estimate pages from content size.
    We deliberately keep each notebook page compact.
  */
  const totalChars = clean.length;

  let targetPages = 3;

  if (totalChars > 5000) targetPages = 4;
  if (totalChars > 7500) targetPages = 5;
  if (totalChars > 10000) targetPages = 6;

  targetPages = Math.min(6, Math.max(3, targetPages));

  const pages: string[] = [];
  let currentBlocks: string[] = [];
  let currentLength = 0;

  const targetChars = Math.ceil(
    totalChars / targetPages
  );

  for (const block of blocks) {
    const nextLength =
      currentLength +
      block.length;

    /*
      Don't split a meaningful section unless
      it has become reasonably large.
    */
    if (
      currentBlocks.length > 0 &&
      nextLength > targetChars &&
      pages.length < targetPages - 1
    ) {
      pages.push(
        currentBlocks.join("\n\n").trim()
      );

      currentBlocks = [];
      currentLength = 0;
    }

    currentBlocks.push(block);
    currentLength += block.length;
  }

  if (currentBlocks.length) {
    pages.push(
      currentBlocks.join("\n\n").trim()
    );
  }

  /*
    Merge tiny trailing pages.
  */
  for (let i = pages.length - 1; i > 0; i--) {
    if (pages[i].length < 500) {
      pages[i - 1] =
        `${pages[i - 1]}\n\n${pages[i]}`.trim();

      pages.splice(i, 1);
    }
  }

  /*
    Hard safety:
    never more than 6 and never less than 3
    unless the content itself is genuinely tiny.
  */
  if (pages.length > 6) {
    const merged: string[] = [];

    for (let i = 0; i < pages.length; i++) {
      const targetIndex = Math.min(
        5,
        Math.floor(
          (i * 6) / pages.length
        )
      );

      merged[targetIndex] =
        `${merged[targetIndex] || ""}\n\n${pages[i]}`
          .trim();
    }

    return merged.filter(Boolean);
  }

  return pages.filter(
    (page) => page.trim().length > 0
  );
}

function FloatingCard({
  className,
  icon,
  title,
  subtitle,
  yellow = false,
  delay = "0s",
}: {
  className: string;
  icon: string;
  title: string;
  subtitle: string;
  yellow?: boolean;
  delay?: string;
}) {
  return (
    <div
      style={{
        animationDelay: delay,
      }}
      className={[
        "pointer-events-none absolute hidden rounded-2xl border px-4 py-3 backdrop-blur-xl lg:block",
        "animate-[floatCard_5s_ease-in-out_infinite]",
        yellow
          ? "border-[#F5B700]/30 bg-[#161309]/90 shadow-[0_25px_70px_rgba(245,183,0,0.12)]"
          : "border-white/[0.09] bg-[#111116]/90 shadow-[0_25px_70px_rgba(0,0,0,0.5)]",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg",
            yellow
              ? "bg-[#F5B700]/10"
              : "bg-white/[0.05]",
          ].join(" ")}
        >
          {icon}
        </div>

        <div>
          <div
            className={[
              "text-[13px] font-black",
              yellow
                ? "text-[#F5B700]"
                : "text-white",
            ].join(" ")}
          >
            {title}
          </div>

          <div className="mt-0.5 text-[10px] font-medium text-slate-500">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}

function KnowledgeCore() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouse = (event: MouseEvent) => {
      const scene = sceneRef.current;
      if (!scene || window.innerWidth < 1024) return;

      const rect = scene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      scene.style.setProperty("--core-rx", `${-y * 7}deg`);
      scene.style.setProperty("--core-ry", `${x * 9}deg`);
    };

    const reset = () => {
      const scene = sceneRef.current;
      if (!scene) return;
      scene.style.setProperty("--core-rx", "0deg");
      scene.style.setProperty("--core-ry", "0deg");
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    window.addEventListener("mouseleave", reset);

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", reset);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      aria-hidden="true"
      className="pointer-events-none relative h-[450px] w-full max-w-[590px] select-none [perspective:1100px] [--core-rx:0deg] [--core-ry:0deg]"
    >
      {/* ambient energy */}
      <div className="absolute left-1/2 top-1/2 h-[290px] w-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5B700]/[0.055] blur-[85px]" />
      <div className="absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/[0.035] blur-[65px]" />

      {/* orbit system */}
      <div className="absolute left-1/2 top-1/2 h-[270px] w-[470px] -translate-x-1/2 -translate-y-1/2 rotate-[16deg] animate-[orbitSlow_16s_linear_infinite] rounded-[50%] border border-[#F5B700]/15" />
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[220px] -translate-x-1/2 -translate-y-1/2 -rotate-[28deg] animate-[orbitReverse_19s_linear_infinite] rounded-[50%] border border-blue-300/[0.08]" />
      <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rotate-[55deg] animate-[orbitSlow_22s_linear_infinite] rounded-[50%] border border-white/[0.055]" />

      {/* floating particles */}
      <span className="absolute left-[18%] top-[28%] h-2 w-2 animate-[particleFloat_4s_ease-in-out_infinite] rounded-full bg-[#F5B700] shadow-[0_0_18px_#F5B700]" />
      <span className="absolute right-[18%] top-[24%] h-1.5 w-1.5 animate-[particleFloat_5s_ease-in-out_infinite] rounded-full bg-blue-300 shadow-[0_0_16px_rgba(147,197,253,.8)]" />
      <span className="absolute bottom-[24%] left-[21%] h-1.5 w-1.5 animate-[particleFloat_6s_ease-in-out_infinite] rounded-full bg-purple-300" />
      <span className="absolute bottom-[20%] right-[24%] h-2 w-2 animate-[particleFloat_4.5s_ease-in-out_infinite] rounded-full bg-emerald-300 shadow-[0_0_15px_rgba(110,231,183,.6)]" />

      {/* main object */}
      <div
        className="absolute left-1/2 top-1/2 h-[270px] w-[270px] -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]"
        style={{
          transform: "rotateX(var(--core-rx)) rotateY(var(--core-ry))",
          transition: "transform 500ms cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {/* shadow plane */}
        <div className="absolute left-1/2 top-[68%] h-[110px] w-[180px] -translate-x-1/2 rounded-full bg-black/70 blur-2xl [transform:rotateX(72deg) translateZ(-75px)]" />

        {/* back glass plates */}
        <div className="absolute left-1/2 top-1/2 h-[150px] w-[190px] -translate-x-1/2 -translate-y-1/2 rotate-[-7deg] rounded-[28px] border border-white/[0.10] bg-white/[0.025] shadow-[0_30px_70px_rgba(0,0,0,.55)] [transform:translateZ(-35px)]" />
        <div className="absolute left-1/2 top-1/2 h-[150px] w-[190px] -translate-x-1/2 -translate-y-1/2 rotate-[7deg] rounded-[28px] border border-[#F5B700]/15 bg-[#F5B700]/[0.025] [transform:translateZ(-20px)]" />

        {/* floating knowledge crystal */}
        <div className="absolute left-1/2 top-1/2 h-[175px] w-[175px] -translate-x-1/2 -translate-y-1/2 animate-[knowledgeFloat_4.2s_ease-in-out_infinite] [transform-style:preserve-3d] [transform:translateZ(25px)]">
          {/* diamond faces */}
          <div className="absolute inset-[18px] rotate-45 rounded-[24px] border border-[#F5B700]/40 bg-gradient-to-br from-[#F5B700]/25 via-[#171717]/95 to-blue-400/10 shadow-[0_0_55px_rgba(245,183,0,.16)]" />
          <div className="absolute inset-[30px] rotate-45 rounded-[18px] border border-white/[0.16] bg-[#0B0B10]/90 shadow-[inset_0_0_35px_rgba(245,183,0,.12)]" />

          {/* inner light */}
          <div className="absolute left-1/2 top-1/2 h-[58px] w-[58px] -translate-x-1/2 -translate-y-1/2 rounded-[18px] border border-[#F5B700]/55 bg-[#F5B700]/15 shadow-[0_0_45px_rgba(245,183,0,.3)] [transform:translateZ(38px)_rotate(45deg)]" />
          <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[#FFE27A] shadow-[0_0_30px_#F5B700] [transform:translateZ(62px)]" />

          {/* tiny floating knowledge nodes */}
          <span className="absolute left-[12%] top-[16%] h-3 w-3 rounded-full border border-white/40 bg-blue-300 shadow-[0_0_18px_rgba(147,197,253,.8)] [transform:translateZ(70px)]" />
          <span className="absolute right-[7%] bottom-[16%] h-3 w-3 rounded-full border border-white/40 bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.7)] [transform:translateZ(72px)]" />
        </div>

        {/* orbital rings around object */}
        <div className="absolute left-1/2 top-1/2 h-[205px] w-[205px] -translate-x-1/2 -translate-y-1/2 rotate-[64deg] animate-[knowledgeRingA_8s_linear_infinite] rounded-[50%] border border-[#F5B700]/30 [transform-style:preserve-3d] [transform:translateZ(50px)_rotateX(64deg)]" />
        <div className="absolute left-1/2 top-1/2 h-[175px] w-[175px] -translate-x-1/2 -translate-y-1/2 rotate-[-38deg] animate-[knowledgeRingB_10s_linear_infinite] rounded-[50%] border border-blue-300/20 [transform-style:preserve-3d] [transform:translateZ(65px)_rotateY(68deg)]" />

        {/* front micro-label */}
        <div className="absolute left-1/2 top-[82%] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/[0.08] bg-[#0D0D12]/85 px-4 py-2 text-[8px] font-black uppercase tracking-[0.32em] text-slate-500 backdrop-blur-xl [transform:translateZ(95px)]">
          IDEA ENGINE
        </div>
      </div>

      {/* floating cards — desktop only */}
      <FloatingCard
        className="left-[0%] top-[20%] -rotate-3"
        icon="✦"
        title="Hidden idea"
        subtitle="Find the connection"
      />
      <FloatingCard
        className="right-[0%] top-[17%] rotate-2"
        icon="🧠"
        title="Understand"
        subtitle="Not just memorize"
        delay="1s"
      />
      <FloatingCard
        className="bottom-[12%] left-[7%] rotate-2"
        icon="⚡"
        title="Learn faster"
        subtitle="Less effort. More clarity."
        yellow
        delay="2s"
      />
      <FloatingCard
        className="bottom-[9%] right-[2%] -rotate-2"
        icon="◎"
        title="See the pattern"
        subtitle="Make the idea click"
        delay="3s"
      />

      <div className="pointer-events-none absolute left-1/2 top-[1%] -translate-x-1/2 animate-[floatCard_6s_ease-in-out_infinite] rounded-2xl border border-[#F5B700]/20 bg-[#111116]/95 px-5 py-3 shadow-[0_20px_50px_rgba(0,0,0,.45)] backdrop-blur-xl">
        <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#F5B700]">DISCOVER</div>
        <div className="mt-1 whitespace-nowrap font-serif text-lg italic text-white">what you can&apos;t see</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* KIVRAA LOADING                                   */
/* ------------------------------------------------ */

function NotesLoading() {
  const messages = [
    "Finding the core idea",
    "Connecting the concepts",
    "Building visual explanations",
    "Organising your notes",
    "Adding memory cues",
  ];

  const [index, setIndex] =
    useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(
        (current) =>
          (current + 1) %
          messages.length
      );
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="loading-notes"
      className="scroll-mt-16 border-t border-white/[0.05] bg-[#09090B] px-5 py-16 sm:px-8"
    >
      <div className="mx-auto max-w-[760px]">

        <div className="relative overflow-hidden rounded-[28px] border border-[#F5B700]/15 bg-[#101014] px-6 py-12 shadow-[0_30px_100px_rgba(0,0,0,.5)] sm:px-12">

          {/* ambient glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5B700]/10 blur-[90px]" />

          <div className="relative flex flex-col items-center">

            {/* animated K */}
            <div className="relative flex h-[105px] w-[105px] items-center justify-center">

              <div className="absolute inset-0 animate-ping rounded-[30px] border border-[#F5B700]/20" />

              <div className="absolute inset-[9px] animate-[loaderRotate_5s_linear_infinite] rounded-[27px] border border-dashed border-[#F5B700]/30" />

              <div className="flex h-[72px] w-[72px] animate-[loaderFloat_2s_ease-in-out_infinite] items-center justify-center rounded-[21px] bg-[#F5B700] shadow-[0_0_45px_rgba(245,183,0,.25)]">

                <span className="text-[43px] font-black text-black">
                  K
                </span>

              </div>
            </div>

            <div className="mt-6 text-center">

              <div className="text-[10px] font-black uppercase tracking-[0.35em] text-[#F5B700]">
                KIVRAA IS THINKING
              </div>

              <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
                Turning this topic into notes
              </h3>

              <p
                key={messages[index]}
                className="mt-2 animate-[fadeUp_.35s_ease-out] text-sm text-slate-500"
              >
                {messages[index]}...
              </p>

            </div>

            {/* progress */}
            <div className="mt-8 h-1.5 w-full max-w-[430px] overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-[45%] animate-[loadingBar_2.2s_ease-in-out_infinite] rounded-full bg-[#F5B700]" />
            </div>

            <div className="mt-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#F5B700]" />
              Creating your study experience
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ */
/* NOTES                                             */
/* ------------------------------------------------ */

function GeneratedNotes({
  topic,
  pages,
  currentPage,
  setCurrentPage,
  style,
}: {
  topic: string;
  pages: string[];
  currentPage: number;
  setCurrentPage: React.Dispatch<
    React.SetStateAction<number>
  >;
  style: Style;
}) {
  return (
    <section
      id="generated-notes"
      className="relative border-t border-white/[0.05] bg-[#09090B] px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[980px]">

        {/* top label */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F5B700]">
              Your Kivraa notes
            </div>

            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
              {topic}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">
              {style}
            </span>

            {pages.length > 1 && (
              <span className="rounded-full border border-white/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">
                {currentPage + 1} / {pages.length}
              </span>
            )}
          </div>
        </div>

        {/* notebook */}
        <div className="relative">

          {/* shadow */}
          <div className="pointer-events-none absolute inset-x-4 bottom-[-12px] h-10 rounded-full bg-black/70 blur-2xl" />

          <div className="relative overflow-hidden rounded-[24px] border border-[#D8CFAE] bg-[#F8F1DE] shadow-[0_25px_80px_rgba(0,0,0,.45)] max-lg:rounded-[18px]">

            {/* paper top */}
            <div className="absolute left-0 right-0 top-0 h-2 bg-[#F5B700]" />

            {/* notebook red margin */}
            <div className="pointer-events-none absolute bottom-0 left-[28px] top-0 w-px bg-red-300/45 sm:left-[44px]" />

            {/* paper lines */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.38]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 37px, rgba(70,90,110,.10) 38px)",
              }}
            />

            {/* page */}
            <div className="kivraa-page-body relative px-12 py-10 sm:px-16 sm:py-12">

              {/* page corner */}
              <div className="absolute right-5 top-5 flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#F5B700]/70" />
                <span className="h-2 w-2 rounded-full bg-blue-300/70" />
                <span className="h-2 w-2 rounded-full bg-pink-300/70" />
              </div>

              <div className="mb-8 flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 rotate-[-2deg] items-center justify-center rounded-[13px] bg-[#F5B700] text-xl font-black text-black shadow-[3px_4px_0_rgba(0,0,0,.10)]">
                  K
                </div>

                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#9C8C57]">
                    study note
                  </div>

                  <div className="kivraa-note-title mt-1 font-[cursive] text-[28px] font-bold leading-none text-[#142C49]">
                    {topic}
                  </div>

                  <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B927D]">
                    learn it · connect it · remember it
                  </div>
                </div>

              </div>

              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{

                  h1: ({ children }) => (
                    <div className="mb-7 mt-2 inline-block rotate-[-1deg] rounded-[9px] bg-[#F5D85B] px-4 py-2 shadow-[2px_3px_0_rgba(0,0,0,.08)]">
                      <h1 className="font-[cursive] text-[25px] font-bold leading-none text-[#172D48] max-lg:font-sans max-lg:font-extrabold max-lg:leading-tight max-lg:text-[23px]">
                        {children}
                      </h1>
                    </div>
                  ),

                  h2: ({ children }) => (
                    <div className="mb-4 mt-8 max-lg:mb-3 max-lg:mt-6">

                      <div className="flex items-center gap-3 max-lg:gap-2.5">

                        <span className="flex h-9 w-9 shrink-0 rotate-[-2deg] items-center justify-center rounded-[10px] bg-[#F5D85B]/80 text-[#172D48] shadow-[2px_3px_0_rgba(0,0,0,.07)] max-lg:h-8 max-lg:w-8">
                          ✦
                        </span>

                        <h2 className="font-[cursive] text-[25px] font-bold leading-none text-[#142C49] max-lg:font-sans max-lg:font-bold max-lg:leading-tight max-lg:text-[21px]">
                          {children}
                        </h2>

                      </div>

                      <div className="ml-12 mt-2 h-[3px] w-20 rounded-full bg-[#F5B700] max-lg:ml-10" />

                    </div>
                  ),

                  h3: ({ children }) => (
                    <h3 className="mb-2 mt-5 font-[cursive] text-[19px] font-bold text-[#17314F] max-lg:font-sans max-lg:font-bold max-lg:leading-snug max-lg:text-[18px]">
                      {children}
                    </h3>
                  ),

                  p: ({ children }) => (
                    <p className="mb-4 font-[cursive] text-[17px] font-medium leading-[1.8] text-[#26384B] max-lg:font-sans max-lg:text-[15.5px] max-lg:leading-[1.7]">
                      {children}
                    </p>
                  ),

                  ul: ({ children }) => (
                    <ul className="mb-5 ml-6 list-disc space-y-2 font-[cursive] text-[16px] leading-7 text-[#26384B] marker:text-[#E7A900] max-lg:font-sans max-lg:text-[15px] max-lg:leading-[1.75]">
                      {children}
                    </ul>
                  ),

                  ol: ({ children }) => (
                    <ol className="mb-5 ml-6 list-decimal space-y-2 font-[cursive] text-[16px] leading-7 text-[#26384B] marker:font-bold marker:text-[#E7A900] max-lg:font-sans max-lg:text-[15px] max-lg:leading-[1.75]">
                      {children}
                    </ol>
                  ),

                  li: ({ children }) => (
                    <li className="pl-1">
                      {children}
                    </li>
                  ),

                  strong: ({ children }) => (
                    <strong className="rounded-[3px] bg-[#FFE875] px-1 font-[cursive] font-bold text-[#132C4B] max-lg:font-sans max-lg:text-[15.5px]">
                      {children}
                    </strong>
                  ),

                  blockquote: ({ children }) => (
                    <blockquote className="relative my-6 rounded-[15px] border border-[#E8C84C] bg-[#FFF0A8]/75 px-5 py-4 shadow-[2px_3px_0_rgba(0,0,0,.06)]">
                      <div className="mb-1 font-[cursive] text-[13px] font-bold text-[#A27600] max-lg:font-sans max-lg:text-[12px]">
                        💡 Think of it like this
                      </div>

                      <div className="font-[cursive] text-[16px] font-medium leading-7 text-[#26384B] max-lg:font-sans max-lg:text-[15px] max-lg:leading-[1.7]">
                        {children}
                      </div>
                    </blockquote>
                  ),

                  code: ({ className, children }) => {
                    const lang = /language-([a-z0-9-]+)/i.exec(className || "")?.[1]?.toLowerCase();
                    const text = String(children ?? "").replace(/\n$/, "").trim();
                    const visualKinds = [
                      "flowchart",
                      "diagram",
                      "cycle",
                      "formula",
                      "important",
                      "remember",
                      "example",
                    ];

                    if (lang && visualKinds.includes(lang)) {
                      const lines = asStringArray(text.split("\n"));
                      let title: string | undefined;
                      const rawItems: string[] = [];

                      for (const line of lines) {
                        const titleMatch = line.match(/^title\s*:\s*(.+)$/i);
                        if (titleMatch && !title) {
                          title = readableVisualText(titleMatch[1].trim());
                        } else {
                          rawItems.push(line);
                        }
                      }

                      const items = visualItems(lang, rawItems);

                      if (!items.length && !title) return null;

                      return (
                        <VisualBlock
                          kind={lang as VisualKind}
                          title={title}
                          items={items}
                          style={style}
                        />
                      );
                    }

                    // Handles AI accidentally wrapping LaTeX-containing text in code formatting.
                    if (text.includes("$") && /\$[^$]+\$/.test(text)) {
                      return (
                        <span className="font-[cursive] text-[16px] font-medium text-[#26384B]">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {text}
                          </ReactMarkdown>
                        </span>
                      );
                    }

                    return (
                      <code
                        className={[
                          "rounded-md bg-[#E9E1C8] px-1.5 py-0.5 text-[14px] text-[#17314F] max-lg:text-[13px]",
                          className ? "font-mono max-lg:font-mono" : "font-[cursive] max-lg:font-sans",
                        ].join(" ")}
                      >
                        {children}
                      </code>
                    );
                  },

                  hr: () => (
                    <div className="my-8 flex items-center gap-3">
                      <div className="h-px flex-1 bg-[#D7CEB3]" />
                      <span className="text-[#D1A900]">
                        ✦
                      </span>
                      <div className="h-px flex-1 bg-[#D7CEB3]" />
                    </div>
                  ),

                  table: ({ children }) => (
                    <div className="my-6 overflow-x-auto rounded-[14px] border border-[#DDD2AE] bg-white/45">
                      <table className="w-full min-w-[500px] border-collapse font-[cursive] text-[15px] max-lg:min-w-[300px] max-lg:font-sans max-lg:text-[13.5px]">
                        {children}
                      </table>
                    </div>
                  ),

                  th: ({ children }) => (
                    <th className="border-b border-[#DDD2AE] bg-[#F5D85B]/50 px-4 py-3 text-left font-bold text-[#172D48]">
                      {children}
                    </th>
                  ),

                  td: ({ children }) => (
                    <td className="border-b border-[#E6DEC7] px-4 py-3 text-[#26384B]">
                      {children}
                    </td>
                  ),

                  img: ({ src, alt }) => (
                    <div className="my-6 overflow-hidden rounded-[16px] border border-[#D8CFAE] bg-white/40 p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src || ""}
                        alt={alt || "Diagram"}
                        className="mx-auto max-h-[360px] max-w-full object-contain"
                      />
                    </div>
                  ),
                }}
              >
                {pages[currentPage]}
              </ReactMarkdown>

              {/* handwritten page footer */}
              <div className="mt-9 flex items-center justify-between border-t border-[#D7CEB3] pt-4 max-lg:mt-6">

                <span className="font-[cursive] text-[12px] italic text-[#9D947D] max-lg:font-sans">
                  Kivraa · make the idea click
                </span>

                <span className="font-[cursive] text-[12px] font-bold text-[#9D947D] max-lg:font-sans">
                  {currentPage + 1}
                </span>

              </div>

            </div>
          </div>
        </div>

        {/* pagination */}
        {pages.length > 1 && (
          <div className="mt-6 flex items-center justify-between">

            <button
              type="button"
              onClick={() =>
                setCurrentPage((p) =>
                  Math.max(0, p - 1)
                )
              }
              disabled={currentPage === 0}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[12px] font-bold text-slate-400 transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-25"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-1.5">
              {pages.map((_, index) => (
                <button
              type="button"
                  key={index}
                  onClick={() =>
                    setCurrentPage(index)
                  }
                  aria-label={`Page ${
                    index + 1
                  }`}
                  className={[
                    "h-2 rounded-full transition-all",
                    currentPage === index
                      ? "w-8 bg-[#F5B700]"
                      : "w-2 bg-white/[0.14] hover:bg-white/[0.3]",
                  ].join(" ")}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(
                    pages.length - 1,
                    p + 1
                  )
                )
              }
              disabled={
                currentPage ===
                pages.length - 1
              }
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[12px] font-bold text-slate-400 transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-25"
            >
              Next →
            </button>

          </div>
        )}
      </div>

    </section>
  );
}

/* ------------------------------------------------ */
/* HERO                                             */
/* ------------------------------------------------ */

export default function Hero() {
  const [topic, setTopic] =
    useState("");

  const [style, setStyle] =
    useState<Style | null>(null);

  const [language, setLanguage] =
    useState<Language | null>(null);

  const [purpose, setPurpose] =
    useState<Purpose | null>(null);

  const [classLevel, setClassLevel] =
    useState<ClassLevel | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [pages, setPages] =
    useState<string[]>([]);

  const [currentPage, setCurrentPage] =
    useState(0);

  const generateNotes = async (
    selectedTopic?: string
  ) => {
    const finalTopic = (
      selectedTopic ?? topic
    ).trim();

    if (!finalTopic) {
      setError(
        "Pehle topic enter karo."
      );
      return;
    }

    if (!classLevel) {
      setError(
        "Please select your class first."
      );
      return;
    }

    /*
      IMPORTANT:
      Notes only generate after button click.
      Typing does NOTHING.
    */

    setLoading(true);
    setError("");
    setPages([]);
    setCurrentPage(0);

    setTimeout(() => {
      document
        .getElementById("loading-notes")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 90);

    try {
      const response = await fetch(
        "/api/ai/summarize",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            topic: finalTopic,
            text: finalTopic,

            style:
              style ?? "Colorful",

            language:
              language ?? "English",

            purpose:
              purpose ?? "Understand",

            classLevel,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Notes generate nahi ho paaye."
        );
      }

      const cleaned =
        cleanGeneratedNotes(
          data?.text ||
            data?.notes ||
            ""
        );

      if (!cleaned) {
        throw new Error(
          "AI ne empty notes return kiye."
        );
      }

      const generatedPages =
        splitNotesIntoPages(
          cleaned,
          style ?? "Colorful"
        );

      if (!generatedPages.length) {
        throw new Error(
          "Notes pages create nahi ho paaye."
        );
      }

      setTopic(finalTopic);
      setPages(generatedPages);
      setCurrentPage(0);

      setTimeout(() => {
        document
          .getElementById(
            "generated-notes"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 150);

    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative z-0 overflow-hidden bg-[#09090B] text-white">

      {/* DESKTOP UI (unchanged) — lg and above */}
      <div className="hidden lg:block">

      {/* background */}
      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[4%] top-[15%] h-[450px] w-[450px] rounded-full bg-[#F5B700]/[0.025] blur-[120px]" />

        <div className="absolute right-[5%] top-[20%] h-[450px] w-[450px] rounded-full bg-purple-500/[0.018] blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize:
              "80px 80px",
          }}
        />
      </div>

      {/* LANDING */}
      <div className="relative z-0 mx-auto max-w-[1380px] px-5 pb-10 pt-14 sm:px-8 lg:px-10 lg:pb-12 lg:pt-16">

        <div className="grid items-center gap-2 lg:grid-cols-[0.95fr_1.05fr]">

          {/* LEFT */}
          <div className="relative z-10 max-w-[650px]">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#F5B700]/25 bg-[#F5B700]/[0.04] px-4 py-2">

              <span className="h-2 w-2 animate-pulse rounded-full bg-[#F5B700] shadow-[0_0_12px_#F5B700]" />

              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F5B700]">
                AI-powered study notes
              </span>

            </div>

            <h1 className="max-w-[650px] text-[58px] font-black leading-[0.87] tracking-[-0.065em] sm:text-[74px] lg:text-[84px] xl:text-[94px]">

              <span className="block text-white">
                Know more.
              </span>

              <span className="block text-[#F5B700]">
                See what&apos;s
              </span>

              <span className="block text-[#F5B700]">
                hidden.
              </span>

            </h1>

            <p className="mt-7 max-w-[570px] text-[16px] leading-7 text-slate-500 sm:text-[17px]">
              Turn difficult topics into visual,
              memorable notes — so you understand
              the idea instead of just memorizing
              the words.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">

              {[
                "Visual explanations",
                "Key formulas",
                "Student-friendly",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3.5 py-2 text-[10px] font-bold text-slate-500"
                >
                  ✓ {item}
                </div>
              ))}

            </div>

          </div>

          {/* CENTRE 3D TILE */}
          <div className="relative z-0 flex h-[450px] items-center justify-center lg:justify-center pointer-events-none">

            <KnowledgeCore />

          </div>

        </div>

        {/* SEARCH */}
        <div className="relative mx-auto mt-1 w-full max-w-[1180px]">

          <div className="rounded-[23px] border border-white/[0.09] bg-[#101014]/90 p-2 shadow-[0_25px_80px_rgba(0,0,0,.45)] backdrop-blur-xl">

            <div className="flex flex-col gap-2 sm:flex-row">

              <div className="flex h-[66px] min-h-[66px] flex-1 items-center rounded-[16px] bg-[#09090D] px-5">

                <span className="mr-4 text-lg text-[#F5B700]">
                  ✦
                </span>

                <input
                  value={topic}
                  onChange={(e) => {
                    setTopic(
                      e.target.value
                    );
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      generateNotes();
                    }
                  }}
                  placeholder="What do you want to understand today?"
                  className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-slate-600"
                />

              </div>

              <button
              type="button"
                onClick={() =>
                  generateNotes()
                }
                disabled={loading}
                className="h-[66px] min-h-[66px] touch-manipulation rounded-[16px] bg-[#F5B700] px-8 text-[13px] font-black text-black transition-all hover:bg-[#FFD23F] hover:shadow-[0_12px_35px_rgba(245,183,0,.18)] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[185px] sm:min-w-[185px]"
              >
                {loading
                  ? "Creating..."
                  : "Create Notes →"}
              </button>

            </div>

          </div>

          {/* quick topics */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">

            <span className="mr-1 text-[9px] font-black uppercase tracking-[0.25em] text-slate-700">
              Try
            </span>

            {quickTopics.map(
              (item) => (
                <button
              type="button"
                  key={item}
                  onClick={() => {
                    setTopic(item);
                    setError("");
                  }}
                  className="touch-manipulation rounded-full border border-white/[0.07] bg-white/[0.02] px-3.5 py-1.5 text-[10px] font-medium text-slate-500 transition hover:border-[#F5B700]/25 hover:bg-[#F5B700]/[0.04] hover:text-white"
                >
                  {item}
                </button>
              )
            )}

          </div>

          {/* class */}
          <div className="mt-4 rounded-[22px] border border-white/[0.07] bg-[#101014]/80 p-3.5 shadow-[0_12px_35px_rgba(0,0,0,.18)] backdrop-blur-xl sm:p-4">

            <div className="mb-3 flex items-center justify-between px-1">

              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#F5B700]">
                  Your Class
                </div>

                <div className="mt-1 text-[11px] font-medium text-slate-600">
                  Notes will adapt to your level
                </div>
              </div>

              {classLevel ? (
                <span className="rounded-full border border-[#F5B700]/25 bg-[#F5B700]/10 px-2.5 py-1 text-[9px] font-black text-[#F5B700]">
                  {classLevel}
                </span>
              ) : (
                <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-700">
                  Required
                </span>
              )}

            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">

              {CLASS_LEVELS.map((level) => {
                const active = classLevel === level;

                return (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setClassLevel(level);
                      setError("");
                    }}
                    className={[
                      "group flex min-h-[48px] touch-manipulation items-center justify-center rounded-[14px] border px-2 text-center transition-all duration-200",
                      active
                        ? "border-[#F5B700] bg-[#F5B700] text-black shadow-[0_8px_24px_rgba(245,183,0,.16)]"
                        : "border-white/[0.06] bg-white/[0.025] text-slate-500 hover:border-[#F5B700]/30 hover:bg-[#F5B700]/[0.06] hover:text-white",
                    ].join(" ")}
                  >
                    <span className="text-[10px] font-black leading-tight sm:text-[11px]">
                      {level}
                    </span>
                  </button>
                );
              })}

            </div>

          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-center text-[12px] text-red-300">
              {error}
            </div>
          )}

        </div>

        {/* OPTIONS */}
        <div className="relative mx-auto mt-9 w-full max-w-[1180px]">

          <div className="mb-4 flex items-end justify-between">

            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#F5B700]">
                Make it yours
              </div>

              <h2 className="mt-1.5 text-xl font-black tracking-[-0.04em]">
                How should Kivraa teach you?
              </h2>
            </div>

            <div className="hidden rounded-full border border-white/[0.07] px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-slate-700 sm:block">
              YOUR CHOICE
            </div>

          </div>

          <div className="grid gap-3 lg:grid-cols-3">

            {/* STYLE */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#101014]/80 p-3">

              <div className="mb-2 px-1 text-[8px] font-black uppercase tracking-[0.25em] text-slate-600">
                Notes style
              </div>

              <div className="grid grid-cols-3 gap-2">

                {[
                  ["🌈", "Colorful", "Visual"],
                  ["✦", "Simple", "Focused"],
                  ["▤", "One Page", "Quick"],
                ].map(
                  ([
                    icon,
                    name,
                    desc,
                  ]) => {
                    const active =
                      style === name;

                    return (
                      <button
              type="button"
                        key={name}
                        onClick={() =>
                          setStyle(
                            name as Style
                          )
                        }
                        className={[
                          "flex min-h-[82px] touch-manipulation flex-col items-start justify-between rounded-xl border p-3 text-left transition-all",
                          active
                            ? "border-[#F5B700]/50 bg-[#F5B700] text-black"
                            : "border-white/[0.05] bg-white/[0.025] text-slate-500 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white",
                        ].join(" ")}
                      >
                        <span className="text-base">
                          {icon}
                        </span>

                        <span className="text-[10px] font-black">
                          {name}
                        </span>

                        <span className="text-[8px] opacity-60">
                          {desc}
                        </span>
                      </button>
                    );
                  }
                )}

              </div>
            </div>

            {/* LANGUAGE */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#101014]/80 p-3">

              <div className="mb-2 px-1 text-[8px] font-black uppercase tracking-[0.25em] text-slate-600">
                Language
              </div>

              <div className="grid grid-cols-3 gap-2">

                {[
                  "English",
                  "Hinglish",
                  "Hindi",
                ].map((item) => {
                  const active =
                    language === item;

                  return (
                    <button
              type="button"
                      key={item}
                      onClick={() =>
                        setLanguage(
                          item as Language
                        )
                      }
                      className={[
                        "flex h-[82px] touch-manipulation items-center justify-center rounded-xl border text-[10px] font-black transition-all",
                        active
                          ? "border-[#F5B700]/50 bg-[#F5B700] text-black"
                          : "border-white/[0.05] bg-white/[0.025] text-slate-500 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white",
                      ].join(" ")}
                    >
                      {item}
                    </button>
                  );
                })}

              </div>
            </div>

            {/* PURPOSE */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#101014]/80 p-3">

              <div className="mb-2 px-1 text-[8px] font-black uppercase tracking-[0.25em] text-slate-600">
                Learning goal
              </div>

              <div className="grid grid-cols-3 gap-2">

                {[
                  ["🧠", "Understand"],
                  ["🎯", "Exam Prep"],
                  ["⚡", "Revision"],
                ].map(
                  ([icon, name]) => {
                    const active =
                      purpose === name;

                    return (
                      <button
              type="button"
                        key={name}
                        onClick={() =>
                          setPurpose(
                            name as Purpose
                          )
                        }
                        className={[
                          "flex h-[82px] touch-manipulation flex-col items-center justify-center gap-1.5 rounded-xl border transition-all",
                          active
                            ? "border-[#F5B700]/50 bg-[#F5B700] text-black"
                            : "border-white/[0.05] bg-white/[0.025] text-slate-500 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white",
                        ].join(" ")}
                      >
                        <span className="text-base">
                          {icon}
                        </span>

                        <span className="text-[9px] font-black">
                          {name}
                        </span>
                      </button>
                    );
                  }
                )}

              </div>
            </div>

          </div>

          <div className="mt-3 text-center text-[8px] font-black uppercase tracking-[0.25em] text-slate-700">
            Choose what feels right · nothing selected by default
          </div>

        </div>

      </div>

      </div>

      {/* MOBILE — dedicated MobileHero (below lg). Desktop (>= lg) untouched. */}
      <div className="relative isolate block overflow-hidden lg:hidden">
        <MobileHero />
      </div>

      {/* LOADING */}
      {loading && <NotesLoading />}

      {/* NOTES */}
      {!loading && pages.length > 0 && (
        <GeneratedNotes
          topic={topic}
          pages={pages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          style={style ?? "Colorful"}
        />
      )}

      <style jsx global>{`

        @keyframes mobileSceneTilt {
          0%,
          100% {
            transform: perspective(1200px) rotateX(-1.5deg) rotateY(-2deg) scale(0.985);
          }
          50% {
            transform: perspective(1200px) rotateX(2.5deg) rotateY(3deg) scale(1);
          }
        }

        @keyframes floatCard {
          0%,
          100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-9px);
          }
        }

        @keyframes knowledgeFloat {
          0%,
          100% {
            transform: translateZ(65px) translateY(0px) rotateZ(0deg);
          }
          50% {
            transform: translateZ(78px) translateY(-10px) rotateZ(5deg);
          }
        }

        @keyframes knowledgeRingA {
          from {
            transform: rotateX(68deg) rotateZ(0deg) translateZ(18px);
          }
          to {
            transform: rotateX(68deg) rotateZ(360deg) translateZ(18px);
          }
        }

        @keyframes knowledgeRingB {
          from {
            transform: rotateY(68deg) rotateZ(0deg) translateZ(28px);
          }
          to {
            transform: rotateY(68deg) rotateZ(-360deg) translateZ(28px);
          }
        }

        @keyframes knowledgeSpark {
          from {
            transform: translate(-50%, -50%) rotate(0deg) translateX(63px) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg) translateX(63px) rotate(-360deg);
          }
        }

        @keyframes coreGlow {
          0%,
          100% {
            opacity: .45;
            transform: scale(.92);
          }
          50% {
            opacity: .9;
            transform: scale(1.08);
          }
        }

        @keyframes coreFloat {
          0%,
          100% {
            transform: translateZ(45px) translateY(0px);
          }

          50% {
            transform: translateZ(45px) translateY(-8px);
          }
        }

        @keyframes orbitSlow {
          from {
            transform:
              translate(-50%, -50%)
              rotate(18deg);
          }

          to {
            transform:
              translate(-50%, -50%)
              rotate(378deg);
          }
        }

        @keyframes orbitReverse {
          from {
            transform:
              translate(-50%, -50%)
              rotate(-28deg);
          }

          to {
            transform:
              translate(-50%, -50%)
              rotate(-388deg);
          }
        }

        @keyframes particleFloat {
          0%,
          100% {
            transform: translateY(0px);
            opacity: 0.55;
          }

          50% {
            transform: translateY(-13px);
            opacity: 1;
          }
        }

        @keyframes loaderRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes loaderFloat {
          0%,
          100% {
            transform: translateY(0px)
              scale(1);
          }

          50% {
            transform: translateY(-6px)
              scale(1.03);
          }
        }

        @keyframes loadingBar {
          0% {
            transform: translateX(-130%);
          }

          50% {
            transform: translateX(120%);
          }

          100% {
            transform: translateX(270%);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes knowledgeFloat {
          0%, 100% { transform: translateZ(25px) translateY(0px) rotateZ(0deg); }
          50% { transform: translateZ(25px) translateY(-10px) rotateZ(2deg); }
        }

        @keyframes knowledgeRingA {
          from { transform: translateZ(50px) rotateX(64deg) rotateZ(0deg); }
          to { transform: translateZ(50px) rotateX(64deg) rotateZ(360deg); }
        }

        @keyframes knowledgeRingB {
          from { transform: translateZ(65px) rotateY(68deg) rotateZ(0deg); }
          to { transform: translateZ(65px) rotateY(68deg) rotateZ(-360deg); }
        }

        /* KaTeX should stay readable */
        .katex {
          font-size: 1em !important;
        }

        .katex-display {
          overflow-x: auto;
          overflow-y: hidden;
          padding: 10px 0;
        }

      `}</style>
    </section>
  );
}