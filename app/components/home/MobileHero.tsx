"use client";

import { useEffect, useState } from "react";
import { CLASS_LEVELS, type ClassLevel } from "../notes/types";
import {
  type Style,
  type Language,
  type Purpose,
  quickTopics,
  STYLE_OPTIONS,
  LANGUAGE_OPTIONS,
  PURPOSE_OPTIONS,
  cleanGeneratedNotes,
  splitNotesIntoPages,
} from "../notes/kivraa";
import MobileGeneratedNotes from "./MobileGeneratedNotes";

const hand = "var(--font-kivraa-hand)";

const loadingMessages = [
  "Finding the core idea",
  "Connecting the concepts",
  "Building visual explanations",
  "Organising your notes",
  "Adding memory cues",
];

/* Compact premium loading — small glowing orb, no huge panel. */
function MobileLoading() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % loadingMessages.length);
    }, 1600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-5">
      <div className="relative mx-auto overflow-hidden rounded-[24px] border border-[#F5B700]/15 bg-[#101014] px-5 py-8">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5B700]/10 blur-[70px]" />

        <div className="relative flex flex-col items-center">
          <div className="mk-load-orb relative flex h-[64px] w-[64px] items-center justify-center">
            <div className="mk-load-ring absolute inset-0 rounded-full border border-dashed border-[#F5B700]/30" />
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[13px] bg-[#F5B700] shadow-[0_0_34px_rgba(245,183,0,.35)]">
              <span className="text-[22px] font-black text-black">K</span>
            </div>
          </div>

          <div className="mk-load-pulse mt-5 text-center">
            <div className="text-[9px] font-black uppercase tracking-[0.35em] text-[#F5B700]">
              KIVRAA IS THINKING
            </div>
            <p key={index} className="mt-2 animate-[mkFadeUp_.35s_ease-out] text-[13px] font-medium text-slate-400">
              {loadingMessages[index]}...
            </p>
          </div>

          <div className="mt-5 h-1 w-56 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="mk-load-bar h-full w-[42%] rounded-full bg-[#F5B700]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Floating knowledge orb — pure CSS, never touchable. */
function MobileKnowledgeOrb() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative mx-auto h-[150px] w-[150px] select-none"
    >
      <div className="mk-orb-glow absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5B700]/[0.12] blur-[42px]" />

      {/* orbit ring */}
      <div className="mk-orb-ring absolute left-1/2 top-1/2 h-[128px] w-[128px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#F5B700]/20" />

      {/* glass core */}
      <div className="mk-orb-core absolute left-1/2 top-1/2 h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rotate-45 rounded-[22px] border border-[#F5B700]/35 bg-gradient-to-br from-[#F5B700]/20 via-[#171717]/90 to-blue-400/10" />
        <div className="absolute inset-[10px] rotate-45 rounded-[14px] border border-white/[0.12] bg-[#0B0B10]/90" />

        {/* inner light */}
        <div className="mk-orb-pulse absolute left-1/2 top-1/2 h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[9px] border border-[#F5B700]/55 bg-[#F5B700]/15 shadow-[0_0_30px_rgba(245,183,0,.35)]" />
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFE27A] shadow-[0_0_18px_#F5B700]" />
      </div>

      {/* tiny knowledge nodes */}
      <span className="mk-orb-node absolute left-[16%] top-[30%] h-2 w-2 rounded-full border border-white/40 bg-blue-300 shadow-[0_0_12px_rgba(147,197,253,.8)]" />
      <span className="mk-orb-node-2 absolute right-[12%] top-[56%] h-2 w-2 rounded-full border border-white/40 bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.7)]" />
      <span className="mk-orb-node-3 absolute bottom-[18%] left-[26%] h-1.5 w-1.5 rounded-full bg-purple-300 shadow-[0_0_10px_rgba(167,139,250,.8)]" />
    </div>
  );
}

export default function MobileHero() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<Style | null>(null);
  const [language, setLanguage] = useState<Language | null>(null);
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [classLevel, setClassLevel] = useState<ClassLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const generateNotes = async (selectedTopic?: string) => {
    const finalTopic = (selectedTopic ?? topic).trim();

    if (!finalTopic) {
      setError("Pehle topic enter karo.");
      return;
    }

    if (!classLevel) {
      setError("Please select your class first.");
      return;
    }

    setLoading(true);
    setError("");
    setPages([]);
    setCurrentPage(0);

    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: finalTopic,
          text: finalTopic,
          style: style ?? "Colorful",
          language: language ?? "English",
          purpose: purpose ?? "Understand",
          classLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Notes generate nahi ho paaye.");
      }

      const cleaned = cleanGeneratedNotes(data?.text || data?.notes || "");

      if (!cleaned) {
        throw new Error("AI ne empty notes return kiye.");
      }

      const generatedPages = splitNotesIntoPages(cleaned, style ?? "Colorful");

      if (!generatedPages.length) {
        throw new Error("Notes pages create nahi ho paaye.");
      }

      setTopic(finalTopic);
      setPages(generatedPages);
      setCurrentPage(0);

      setTimeout(() => {
        document
          .getElementById("generated-notes")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err: any) {
      setError(
        err?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const chipBase =
    "flex touch-manipulation items-center justify-center rounded-[14px] border text-center transition-all duration-200";

  const activeChip =
    "border-[#F5B700] bg-[#F5B700] text-black shadow-[0_8px_24px_rgba(245,183,0,.16)]";

  const idleChip =
    "border-white/[0.06] bg-white/[0.025] text-slate-400 active:border-[#F5B700]/30 active:bg-[#F5B700]/[0.06] active:text-white";

  return (
    <div id="generator" className="kivraa-mobile-hero relative isolate overflow-hidden">
      {/* ambient atmosphere — decorative only, never touchable */}
      <div aria-hidden="true" className="kivraa-atmos">
        <div className="kivraa-atmos-orb kivraa-atmos-orb-glow" />
        <div className="kivraa-atmos-orb kivraa-atmos-orb-blue" />
        <div className="kivraa-atmos-orb kivraa-atmos-orb-violet" />
        <div className="kivraa-atmos-ring" />
        <div className="kivraa-atmos-ring kivraa-atmos-ring-2" />
        <div className="kivraa-atmos-dust" style={{ left: "10%", top: "10%", animationDelay: "0s" }} />
        <div className="kivraa-atmos-dust kivraa-dust-blue" style={{ left: "74%", top: "6%", animationDelay: "-2s" }} />
        <div className="kivraa-atmos-dust kivraa-dust-white" style={{ left: "30%", top: "18%", animationDelay: "-4s" }} />
        <div className="kivraa-atmos-dust kivraa-dust-big" style={{ left: "56%", top: "12%", animationDelay: "-1s" }} />
        <div className="kivraa-atmos-crystal" style={{ top: "3%", right: "18%" }} />
        <div className="kivraa-atmos-crystal kivraa-atmos-crystal-2" style={{ top: "52%", left: "10%" }} />
      </div>

      <div className="relative z-[1] px-4 pb-12 pt-6">
        {/* badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#F5B700]/25 bg-[#F5B700]/[0.04] px-3 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#F5B700]" />
          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#F5B700]">
            AI-powered study notes
          </span>
        </div>

        {/* headline */}
        <h1 className="mt-4 text-[36px] font-black leading-[0.98] tracking-[-0.05em]">
          <span className="block text-white">Know more.</span>
          <span className="block text-[#F5B700]">See what&apos;s hidden.</span>
        </h1>

        <p className="mt-3 max-w-[330px] text-[13px] leading-[1.65] text-slate-500">
          Turn difficult topics into visual, memorable notes — so you actually
          understand the idea instead of just memorizing the words.
        </p>

        {/* floating knowledge object */}
        <div className="mt-2">
          <MobileKnowledgeOrb />
        </div>

        {/* search / create */}
        <div className="mt-4 rounded-[22px] border border-white/[0.09] bg-[#101014]/95 p-2">
          <label
            htmlFor="mk-topic-input"
            className="flex min-h-[54px] items-center rounded-[15px] bg-[#09090D] px-4"
          >
            <span className="mr-3 text-lg text-[#F5B700]">✦</span>
            <input
              id="mk-topic-input"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") generateNotes();
              }}
              placeholder="What do you want to understand today?"
              className="min-h-[44px] w-full bg-transparent text-[15px] text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <button
            type="button"
            onClick={() => generateNotes()}
            disabled={loading}
            className="mt-2 flex h-[54px] min-h-[54px] w-full touch-manipulation items-center justify-center rounded-[15px] bg-[#F5B700] text-[15px] font-black text-black transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Notes →"}
          </button>
        </div>

        {/* quick topics */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-[9px] font-black uppercase tracking-[0.25em] text-slate-700">
            Try
          </span>
          {quickTopics.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTopic(item);
                setError("");
              }}
              className="min-h-[44px] touch-manipulation rounded-full border border-white/[0.07] bg-white/[0.02] px-4 py-2 text-[12px] font-medium text-slate-400 transition active:border-[#F5B700]/40 active:bg-[#F5B700]/[0.06] active:text-white"
            >
              {item}
            </button>
          ))}
        </div>

        {/* class */}
        <div className="mt-5 rounded-[22px] border border-white/[0.07] bg-[#101014]/95 p-4">
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
              <span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">
                Required
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
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
                    chipBase,
                    "min-h-[48px] px-1.5",
                    active ? activeChip : idleChip,
                  ].join(" ")}
                >
                  <span className="text-[11px] font-black leading-tight">
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

        {/* options */}
        <div className="mt-5">
          <div className="mb-3 px-1">
            <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#F5B700]">
              Make it yours
            </div>
            <div className="mt-1 text-lg font-black tracking-[-0.04em]">
              How should Kivraa teach you?
            </div>
          </div>

          {/* style */}
          <div className="rounded-[22px] border border-white/[0.07] bg-[#101014]/95 p-4">
            <div className="mb-2 px-1 text-[8px] font-black uppercase tracking-[0.25em] text-slate-600">
              Notes style
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STYLE_OPTIONS.map(({ icon, name, desc }) => {
                const active = style === name;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setStyle(name)}
                    className={[
                      chipBase,
                      "min-h-[64px] flex-col justify-center gap-1 p-2",
                      active ? activeChip : idleChip,
                    ].join(" ")}
                  >
                    <span className="text-base leading-none">{icon}</span>
                    <span className="text-[11px] font-black leading-none">
                      {name}
                    </span>
                    <span className="text-[9px] leading-none opacity-60">
                      {desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* language */}
          <div className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#101014]/95 p-4">
            <div className="mb-2 px-1 text-[8px] font-black uppercase tracking-[0.25em] text-slate-600">
              Language
            </div>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGE_OPTIONS.map((item) => {
                const active = language === item;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setLanguage(item)}
                    className={[
                      chipBase,
                      "min-h-[52px] text-[12px] font-black",
                      active ? activeChip : idleChip,
                    ].join(" ")}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* purpose */}
          <div className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#101014]/95 p-4">
            <div className="mb-2 px-1 text-[8px] font-black uppercase tracking-[0.25em] text-slate-600">
              Learning goal
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PURPOSE_OPTIONS.map(({ icon, name }) => {
                const active = purpose === name;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPurpose(name)}
                    className={[
                      chipBase,
                      "min-h-[60px] flex-col justify-center gap-1",
                      active ? activeChip : idleChip,
                    ].join(" ")}
                  >
                    <span className="text-base leading-none">{icon}</span>
                    <span className="text-[10px] font-black leading-none">
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-3 text-center text-[8px] font-black uppercase tracking-[0.25em] text-slate-700">
            Choose what feels right · nothing selected by default
          </p>
        </div>
      </div>

      {/* mobile loading */}
      {loading && <div className="px-4"><MobileLoading /></div>}

      {/* mobile notes */}
      {!loading && pages.length > 0 && (
        <MobileGeneratedNotes
          topic={topic}
          pages={pages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          style={style ?? "Colorful"}
        />
      )}

      <style jsx global>{`
        @keyframes mkFloat {
          0%, 100% { transform: translateY(0px) rotateZ(0deg); }
          50% { transform: translateY(-9px) rotateZ(2deg); }
        }
        @keyframes mkBreath {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.96; }
        }
        @keyframes mkRingSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes mkOrbPulse {
          0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes mkNodeFloat {
          0%, 100% { transform: translateY(0px); opacity: 0.6; }
          50% { transform: translateY(-7px); opacity: 1; }
        }
        @keyframes mkLoadRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes mkLoadBar {
          0% { transform: translateX(-130%); }
          50% { transform: translateX(120%); }
          100% { transform: translateX(270%); }
        }
        @keyframes mkFadeUp {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mk-orb-core { animation: mkFloat 6.5s ease-in-out infinite; }
        .mk-orb-glow { animation: mkBreath 7s ease-in-out infinite; }
        .mk-orb-ring { animation: mkRingSpin 22s linear infinite; }
        .mk-orb-pulse { animation: mkOrbPulse 4s ease-in-out infinite; }
        .mk-orb-node { animation: mkNodeFloat 4.5s ease-in-out infinite; }
        .mk-orb-node-2 { animation: mkNodeFloat 5.5s ease-in-out infinite; animation-delay: -2s; }
        .mk-orb-node-3 { animation: mkNodeFloat 4s ease-in-out infinite; animation-delay: -1s; }

        .mk-load-ring { animation: mkLoadRing 3.2s linear infinite; }
        .mk-load-bar { animation: mkLoadBar 1.8s ease-in-out infinite; }
        .mk-load-orb { animation: mkFloat 2.6s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .mk-orb-core,
          .mk-orb-glow,
          .mk-orb-ring,
          .mk-orb-pulse,
          .mk-orb-node,
          .mk-orb-node-2,
          .mk-orb-node-3,
          .mk-load-ring,
          .mk-load-bar,
          .mk-load-orb {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}