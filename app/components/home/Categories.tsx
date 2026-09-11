"use client";

import { useState } from "react";

const subjects = [
  {
    title: "Engineering",
    label: "BUILD",
    icon: "⚙️",
    description: "Build. Solve. Understand.",
    gradient:
      "from-[#F8C83E] via-[#F5B700] to-[#E79A00]",
    iconBg: "bg-[#FFF3C4]",
    iconText: "text-[#6D5100]",
  },
  {
    title: "Medical",
    label: "DISCOVER",
    icon: "🧬",
    description: "Discover how life works.",
    gradient:
      "from-[#FF9DB7] via-[#F4779B] to-[#E85D82]",
    iconBg: "bg-[#FFE4EB]",
    iconText: "text-[#7C2945]",
  },
  {
    title: "Computer Science",
    label: "CREATE",
    icon: "💻",
    description: "Think. Code. Create.",
    gradient:
      "from-[#A99AFF] via-[#8170E8] to-[#654FC4]",
    iconBg: "bg-[#EAE6FF]",
    iconText: "text-[#44358E]",
  },
  {
    title: "Commerce",
    label: "GROW",
    icon: "📊",
    description: "Numbers that make sense.",
    gradient:
      "from-[#70DDB8] via-[#42C79B] to-[#25A77E]",
    iconBg: "bg-[#DDF8EE]",
    iconText: "text-[#17634C]",
  },
  {
    title: "Law",
    label: "ARGUE",
    icon: "⚖️",
    description: "Cases. Logic. Reasoning.",
    gradient:
      "from-[#FFBD7A] via-[#F49A52] to-[#DD7430]",
    iconBg: "bg-[#FFF0DF]",
    iconText: "text-[#783C17]",
  },
];

export default function Categories() {
  const [active, setActive] = useState(0);

  const selected = subjects[active];

  return (
    <section
      id="subjects"
      className="relative overflow-hidden bg-[#09090D] py-14 sm:py-20"
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5B700]/[0.025] blur-[150px]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2">
            <span className="text-sm">🪄</span>

            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-500">
              Choose your world
            </span>
          </div>

          <h2 className="text-4xl font-black leading-[0.9] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
            What are you
            <br />
            <span className="text-[#F5B700]">
              into?
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-md text-xs leading-6 text-gray-600 sm:text-sm">
            Pick a subject. We’ll make the difficult stuff
            feel surprisingly simple.
          </p>
        </div>

        {/* =====================================================
            SUBJECT CARDS
        ===================================================== */}

        <div className="relative mx-auto mt-12 max-w-6xl">
          {/* DESKTOP */}

          <div className="hidden items-end justify-center gap-3 lg:flex">
            {subjects.map((subject, index) => {
              const isActive = active === index;

              return (
                <button
                  type="button"
                  key={subject.title}
                  onClick={() => setActive(index)}
                  className={`group relative w-[190px] transition-all duration-500 ${
                    isActive
                      ? "z-20 -translate-y-7 scale-110"
                      : "hover:z-10 hover:-translate-y-3 hover:scale-105"
                  }`}
                >
                  {/* SHADOW */}

                  <div
                    className={`absolute -bottom-5 left-1/2 h-8 w-32 -translate-x-1/2 rounded-full bg-black/70 blur-xl transition-all duration-500 ${
                      isActive
                        ? "opacity-80"
                        : "opacity-40"
                    }`}
                  />

                  {/* CARD */}

                  <div
                    className={`relative h-[275px] overflow-hidden rounded-[28px] border border-white/[0.075] bg-[#111116] p-4 text-left shadow-[0_25px_70px_rgba(0,0,0,0.4)] transition-all duration-500 ${
                      index === 0
                        ? "-rotate-2"
                        : index === 1
                        ? "rotate-2"
                        : index === 2
                        ? "-rotate-1"
                        : index === 3
                        ? "rotate-2"
                        : "-rotate-2"
                    } ${
                      isActive
                        ? "border-white/[0.15] shadow-[0_35px_90px_rgba(0,0,0,0.5)]"
                        : "group-hover:border-white/[0.12]"
                    }`}
                  >
                    {/* COLOUR PANEL */}

                    <div
                      className={`relative flex h-[125px] items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br ${subject.gradient}`}
                    >
                      {/* soft shapes */}

                      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/[0.18] blur-[1px]" />

                      <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-black/[0.08]" />

                      <div className="absolute left-8 top-5 h-2 w-2 rounded-full bg-white/30" />

                      <div className="absolute bottom-6 right-8 h-1.5 w-1.5 rounded-full bg-white/30" />

                      {/* ICON */}

                      <div
                        className={`relative flex h-[76px] w-[76px] items-center justify-center rounded-[23px] ${subject.iconBg} ${subject.iconText} text-3xl shadow-[0_15px_35px_rgba(0,0,0,0.12)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
                      >
                        {subject.icon}
                      </div>
                    </div>

                    {/* TEXT */}

                    <div className="mt-5">
                      <span className="text-[8px] font-black uppercase tracking-[0.25em] text-gray-600">
                        {subject.label}
                      </span>

                      <h3 className="mt-1 text-[16px] font-black tracking-[-0.035em] text-white">
                        {subject.title}
                      </h3>

                      <p className="mt-1 text-[9px] leading-4 text-gray-600">
                        {subject.description}
                      </p>
                    </div>

                    {/* ARROW */}

                    <div
                      className={`absolute bottom-4 right-4 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-[#F5B700] text-black shadow-[0_5px_18px_rgba(245,183,0,0.18)]"
                          : "bg-white/[0.04] text-gray-600 group-hover:bg-white/[0.08] group-hover:text-white"
                      }`}
                    >
                      →
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* =================================================
              MOBILE
          ================================================= */}

          <div className="grid grid-cols-2 gap-3 lg:hidden">
            {subjects.map((subject, index) => {
              const isActive = active === index;

              return (
                <button
                  type="button"
                  key={subject.title}
                  onClick={() => setActive(index)}
                  className={`group relative overflow-hidden rounded-[22px] border p-3 text-left transition-all duration-300 ${
                    index === 4 ? "col-span-2" : ""
                  } ${
                    isActive
                      ? "-translate-y-1 border-white/[0.14] bg-[#15151B]"
                      : "border-white/[0.06] bg-[#101015]"
                  }`}
                >
                  <div
                    className={`flex h-24 items-center justify-center overflow-hidden rounded-[17px] bg-gradient-to-br ${subject.gradient}`}
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${subject.iconBg} ${subject.iconText} text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    >
                      {subject.icon}
                    </div>
                  </div>

                  <div className="px-1 pb-1 pt-3">
                    <p className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-600">
                      {subject.label}
                    </p>

                    <p className="mt-1 text-xs font-black text-white">
                      {subject.title}
                    </p>

                    <p className="mt-1 text-[9px] text-gray-600">
                      {subject.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================
            ACTIVE CTA
        ===================================================== */}

        <div className="mx-auto mt-10 flex max-w-xl items-center justify-between rounded-[20px] border border-white/[0.07] bg-[#111116] p-3 pl-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${selected.gradient} text-lg shadow-[0_8px_25px_rgba(0,0,0,0.15)]`}
            >
              {selected.icon}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[11px] font-black text-white">
                Ready for {selected.title}?
              </p>

              <p className="mt-0.5 text-[9px] text-gray-600">
                Let Kivraa make your next topic click.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("generator")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                })
            }
            className="shrink-0 rounded-xl bg-[#F5B700] px-4 py-2.5 text-[10px] font-black text-black transition-all hover:scale-[1.03] hover:bg-[#FFD23F]"
          >
            Start →
          </button>
        </div>

        {/* BOTTOM */}

        <div className="mt-9 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-white/[0.05]" />

          <span className="text-[8px] font-black uppercase tracking-[0.25em] text-gray-700">
            Learn without the boring part
          </span>

          <div className="h-px w-12 bg-white/[0.05]" />
        </div>
      </div>
    </section>
  );
}