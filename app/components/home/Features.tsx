"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    number: "01",
    icon: "🧠",
    title: "Understand Faster",
    description:
      "Difficult ideas become simple explanations, visual connections and easy-to-follow concepts.",
  },
  {
    number: "02",
    icon: "✦",
    title: "See the Concept",
    description:
      "Turn boring paragraphs into visual flows, key ideas and memorable learning cues.",
  },
  {
    number: "03",
    icon: "⚡",
    title: "Remember Better",
    description:
      "Important points stand out so your brain knows what actually matters.",
  },
  {
    number: "04",
    icon: "↗",
    title: "Revise Quickly",
    description:
      "Come back later and understand the whole topic without reading everything again.",
  },
];

export default function Features() {
  const [active, setActive] = useState(0);
  const [notebookActive, setNotebookActive] = useState(false);
  const [tilt, setTilt] = useState({
    x: 8,
    y: -13,
  });

  const notebookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((current) => (current + 1) % features.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  function handleNotebookMove(
    event: React.MouseEvent<HTMLDivElement>
  ) {
    const element = notebookRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) / rect.width - 0.5) * 2;

    const y =
      ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    setTilt({
      x: 8 + y * -5,
      y: -13 + x * 8,
    });
  }

  function resetNotebook() {
    setNotebookActive(false);

    setTilt({
      x: 8,
      y: -13,
    });
  }

  function activateNotebook() {
    setNotebookActive(true);

    setTilt({
      x: 3,
      y: -5,
    });

    setTimeout(() => {
      setNotebookActive(false);

      setTilt({
        x: 8,
        y: -13,
      });
    }, 700);
  }

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#09090D] py-10 sm:py-12"
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#F5B700]/[0.025] blur-[140px]" />

      <div className="pointer-events-none absolute -left-32 top-1/2 h-72 w-72 rounded-full bg-purple-500/[0.018] blur-[120px]" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-blue-500/[0.018] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F5B700]" />

            <span className="text-[9px] font-black uppercase tracking-[0.24em] text-gray-500">
              Why Kivraa
            </span>
          </div>

          <h2 className="text-3xl font-black tracking-[-0.055em] text-white sm:text-4xl lg:text-5xl">
            Study smarter.
            <span className="text-[#F5B700]">
              {" "}
              Remember longer.
            </span>
          </h2>

          <p className="mx-auto mt-2.5 max-w-xl text-xs leading-6 text-gray-600 sm:text-sm">
            Not another boring notes app. Kivraa turns learning into
            something you can actually see, understand and remember.
          </p>
        </div>

        {/* =====================================================
            MAIN EXPERIENCE
        ===================================================== */}

        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          {/* ===================================================
              3D NOTEBOOK
          =================================================== */}

          <div
            ref={notebookRef}
            onMouseMove={handleNotebookMove}
            onMouseLeave={resetNotebook}
            onClick={activateNotebook}
            className="relative mx-auto flex h-[330px] w-full max-w-[500px] cursor-pointer items-center justify-center select-none sm:h-[390px]"
            style={{
              perspective: "1200px",
            }}
          >
            {/* =================================================
                AMBIENT GLOW
            ================================================= */}

            <div
              className={`pointer-events-none absolute left-1/2 top-1/2 rounded-full bg-[#F5B700]/10 blur-[80px] transition-all duration-500 ${
                notebookActive
                  ? "h-72 w-72 opacity-100"
                  : "h-52 w-52 opacity-70"
              }`}
              style={{
                transform:
                  "translate(-50%, -50%)",
              }}
            />

            {/* =================================================
                ORBIT RINGS
            ================================================= */}

            <div
              className="absolute h-[260px] w-[260px] rounded-full border border-[#F5B700]/10 transition-transform duration-700 sm:h-[300px] sm:w-[300px]"
              style={{
                transform: `rotateX(68deg) rotateZ(-12deg) scale(${
                  notebookActive ? 1.06 : 1
                })`,
              }}
            />

            <div
              className="absolute h-[215px] w-[215px] rounded-full border border-white/[0.055] transition-transform duration-700 sm:h-[250px] sm:w-[250px]"
              style={{
                transform: `rotateX(68deg) rotateZ(28deg) scale(${
                  notebookActive ? 1.04 : 1
                })`,
              }}
            />

            {/* =================================================
                FLOATING PARTICLES
            ================================================= */}

            <div className="absolute left-[18%] top-[18%] h-2 w-2 rounded-full bg-[#F5B700] shadow-[0_0_18px_rgba(245,183,0,0.7)]" />

            <div className="absolute right-[17%] top-[27%] h-1.5 w-1.5 rounded-full bg-blue-300 shadow-[0_0_15px_rgba(147,197,253,0.7)]" />

            <div className="absolute bottom-[20%] left-[23%] h-1.5 w-1.5 rounded-full bg-purple-300 shadow-[0_0_15px_rgba(216,180,254,0.6)]" />

            <div className="absolute bottom-[25%] right-[22%] h-2 w-2 rounded-full bg-green-300 shadow-[0_0_15px_rgba(134,239,172,0.6)]" />

            {/* =================================================
                3D STACK
            ================================================= */}

            <div
              className="relative h-[220px] w-[180px] transition-transform duration-500 ease-out sm:h-[250px] sm:w-[205px]"
              style={{
                transform: `
                  rotateX(${tilt.x}deg)
                  rotateY(${tilt.y}deg)
                  rotateZ(-3deg)
                  scale(${notebookActive ? 1.13 : 1})
                  translateZ(${notebookActive ? 35 : 0}px)
                `,
                transformStyle: "preserve-3d",
              }}
            >
              {/* BACK CARD */}

              <div
                className="absolute inset-0 rounded-[24px] border border-white/[0.05] bg-[#15151C] shadow-[0_30px_70px_rgba(0,0,0,0.45)]"
                style={{
                  transform:
                    "translateZ(-35px) translateX(20px) translateY(15px) rotateZ(5deg)",
                }}
              >
                <div className="p-5 opacity-30">
                  <div className="h-2 w-16 rounded-full bg-white/20" />

                  <div className="mt-5 h-2 w-full rounded-full bg-white/10" />

                  <div className="mt-2 h-2 w-4/5 rounded-full bg-white/10" />

                  <div className="mt-8 h-16 rounded-xl bg-white/[0.03]" />
                </div>
              </div>

              {/* MIDDLE CARD */}

              <div
                className="absolute inset-0 rounded-[24px] border border-white/[0.06] bg-[#121219] shadow-[0_35px_80px_rgba(0,0,0,0.5)]"
                style={{
                  transform:
                    "translateZ(-18px) translateX(10px) translateY(8px) rotateZ(2deg)",
                }}
              >
                <div className="p-5 opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="h-2 w-20 rounded-full bg-[#F5B700]/30" />

                    <div className="h-5 w-5 rounded-md bg-white/[0.05]" />
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="h-2 w-full rounded-full bg-white/10" />

                    <div className="h-2 w-4/5 rounded-full bg-white/10" />

                    <div className="h-2 w-3/5 rounded-full bg-white/10" />
                  </div>
                </div>
              </div>

              {/* =================================================
                  FRONT NOTEBOOK
              ================================================= */}

              <div
                className="absolute inset-0 overflow-hidden rounded-[24px] border border-black/10 bg-[#f7f0dd] shadow-[0_40px_90px_rgba(0,0,0,0.5)]"
                style={{
                  transform: "translateZ(8px)",
                  backgroundImage: `
                    repeating-linear-gradient(
                      to bottom,
                      rgba(247,240,221,1) 0px,
                      rgba(247,240,221,1) 25px,
                      rgba(164,190,211,0.42) 26px
                    )
                  `,
                }}
              >
                {/* NOTEBOOK MARGIN */}

                <div className="absolute bottom-0 left-6 top-0 border-l border-red-300/45" />

                {/* NOTE CONTENT */}

                <div
                  className="relative px-5 py-6 pl-9"
                  style={{
                    fontFamily:
                      '"Segoe Print", "Comic Sans MS", cursive',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-lg bg-[#dce9f7] px-2.5 py-1 text-[8px] font-black text-[#173b6c]">
                      CONCEPT
                    </div>

                    <span className="text-xs">
                      ✦
                    </span>
                  </div>

                  <div className="mt-5 text-[19px] font-black leading-tight text-[#173b6c]">
                    Difficult
                    <br />
                    topic
                  </div>

                  {/* MINI FLOW */}

                  <div className="mt-5 flex items-center gap-1.5">
                    <div className="flex h-8 flex-1 items-center justify-center rounded-lg bg-[#fff0a6] text-[8px] font-black text-[#594900]">
                      IDEA
                    </div>

                    <span className="text-[10px] font-black text-[#173b6c]/40">
                      →
                    </span>

                    <div className="flex h-8 flex-1 items-center justify-center rounded-lg bg-[#dff2ff] text-[8px] font-black text-[#174d69]">
                      SIMPLE
                    </div>
                  </div>

                  {/* MEMORY */}

                  <div className="mt-5 rounded-xl border border-[#F5B700]/25 bg-[#fff2a9]/75 p-2.5">
                    <div className="text-[7px] font-black uppercase tracking-[0.15em] text-[#735e00]">
                      Remember
                    </div>

                    <div className="mt-1 text-[10px] font-bold leading-4 text-[#3e3500]">
                      See it → Understand it → Remember it
                    </div>
                  </div>

                  {/* LINES */}

                  <div className="mt-5 space-y-1.5">
                    <div className="h-1.5 w-full rounded-full bg-[#173b6c]/10" />

                    <div className="h-1.5 w-4/5 rounded-full bg-[#173b6c]/10" />

                    <div className="h-1.5 w-3/5 rounded-full bg-[#173b6c]/10" />
                  </div>
                </div>

                {/* PAGE SHINE */}

                <div
                  className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
                    notebookActive
                      ? "opacity-100"
                      : "opacity-70"
                  }`}
                  style={{
                    background:
                      "linear-gradient(125deg, rgba(255,255,255,0.4), transparent 35%, transparent 70%, rgba(255,255,255,0.08))",
                  }}
                />
              </div>

              {/* =================================================
                  MEMORY CHIP
              ================================================= */}

              <div
                className={`absolute -right-16 top-8 rounded-2xl border border-white/[0.08] bg-[#15151B]/95 px-3 py-2 shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-500 ${
                  notebookActive
                    ? "translate-x-2 -translate-y-2"
                    : ""
                }`}
                style={{
                  transform: `translateZ(55px) rotateZ(5deg)`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    ⚡
                  </span>

                  <div>
                    <p className="text-[8px] font-black uppercase tracking-wider text-[#F5B700]">
                      Memory
                    </p>

                    <p className="text-[9px] text-gray-400">
                      Made easier
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  VISUAL CHIP
              ================================================= */}

              <div
                className={`absolute -bottom-5 -left-16 rounded-2xl border border-white/[0.08] bg-[#15151B]/95 px-3 py-2 shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-500 ${
                  notebookActive
                    ? "-translate-x-2 translate-y-2"
                    : ""
                }`}
                style={{
                  transform:
                    "translateZ(48px) rotateZ(-5deg)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    👀
                  </span>

                  <div>
                    <p className="text-[8px] font-black uppercase tracking-wider text-white">
                      Visual
                    </p>

                    <p className="text-[9px] text-gray-500">
                      Learn by seeing
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* TOUCH HINT */}

            <div
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-[0.22em] text-gray-700 transition-opacity duration-300 ${
                notebookActive
                  ? "opacity-0"
                  : "opacity-70"
              }`}
            >
              Touch to explore
            </div>
          </div>

          {/* ===================================================
              FEATURE CARDS
          =================================================== */}

          <div className="grid gap-2.5 sm:grid-cols-2">
            {features.map((feature, index) => {
              const isActive = active === index;

              return (
                <button
                  type="button"
                  key={feature.number}
                  onClick={() => setActive(index)}
                  className={`group relative overflow-hidden rounded-[20px] border p-4 text-left transition-all duration-300 sm:p-5 ${
                    isActive
                      ? "border-white/[0.10] bg-[#121218] shadow-[0_15px_50px_rgba(245,183,0,0.035)]"
                      : "border-white/[0.06] bg-[#101015] hover:border-white/[0.11] hover:bg-[#121219]"
                  }`}
                >
                  {/* ACTIVE LIGHT */}

                  {isActive && (
                    <>
                      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-[#F5B700]/[0.055] blur-[45px]" />

                      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#F5B700]/25 to-transparent" />
                    </>
                  )}

                  <div className="relative flex items-start justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-transform duration-300 group-hover:-translate-y-0.5 ${
                        isActive
                          ? "bg-[#F5B700]/10"
                          : "bg-white/[0.035]"
                      }`}
                    >
                      {feature.icon}
                    </div>

                    <span
                      className={`text-[9px] font-black tracking-[0.18em] ${
                        isActive
                          ? "text-[#F5B700]/55"
                          : "text-gray-700"
                      }`}
                    >
                      {feature.number}
                    </span>
                  </div>

                  <h3
                    className={`relative mt-4 text-sm font-black tracking-tight ${
                      isActive
                        ? "text-white"
                        : "text-white"
                    }`}
                  >
                    {feature.title}
                  </h3>

                  <p className="relative mt-1.5 text-[11px] leading-5 text-gray-600">
                    {feature.description}
                  </p>

                  <div
                    className={`relative mt-4 h-px transition-all duration-300 ${
                      isActive
                        ? "w-full bg-white/[0.08]"
                        : "w-8 bg-white/10 group-hover:w-14"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================
            BOTTOM SIGNAL
        ===================================================== */}

        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="h-px w-10 bg-white/[0.06]" />

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F5B700]" />

            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-gray-700">
              Learn by understanding
            </span>
          </div>

          <div className="h-px w-10 bg-white/[0.06]" />
        </div>
      </div>
    </section>
  );
}