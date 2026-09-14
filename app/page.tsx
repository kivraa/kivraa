"use client";

import Link from "next/link";
import Hero from "./components/home/Hero";
import Features from "./components/home/Features";
import Categories from "./components/home/Categories";
import { KivraaLogoStatic } from "./components/KivraaLogo";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white">

      {/* AUTH NAV — slim static top bar (only addition to homepage) */}
      <header className="border-b border-white/[0.06] bg-[#0B0B0F]/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5"
          >
            <KivraaLogoStatic
              size={32}
              className="-my-1"
            />
            <span className="hidden text-base font-black tracking-[-0.04em] text-white sm:inline">
              kivraa
            </span>
          </button>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="flex min-h-[44px] items-center rounded-xl px-3.5 text-xs font-bold text-white/90 transition hover:bg-white/[0.06] hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="flex min-h-[44px] items-center rounded-xl bg-[#F5B700] px-4 text-xs font-black text-black shadow-[0_4px_14px_rgba(245,183,0,.25)] transition hover:bg-[#FFD23F]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <Hero />

      <Features />

      <Categories />

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#08080B]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">

          <div className="grid gap-8 md:grid-cols-[1.6fr_1fr_1fr]">

            {/* BRAND */}

            <div className="max-w-sm">

              <button
                type="button"
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }
                className="flex items-center gap-2.5"
              >
                <KivraaLogoStatic
                  size={36}
                  className="-my-1"
                />

                <div className="text-left">
                  <div className="text-xl font-black tracking-[-0.04em] text-white">
                    kivraa
                  </div>

                  <div className="-mt-0.5 text-[8px] font-medium tracking-[0.22em] text-gray-600">
                    STUDY SMARTER
                  </div>
                </div>
              </button>

              <p className="mt-4 max-w-sm text-sm leading-6 text-gray-600">
                Turn difficult topics into notes that are easier to
                understand, remember and revise.
              </p>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("generator")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="mt-5 rounded-xl bg-[#F5B700] px-4 py-2.5 text-xs font-bold text-black transition hover:bg-[#FFD23F]"
              >
                Start learning →
              </button>
            </div>

            {/* PRODUCT */}

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">
                Product
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("generator")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-fit text-xs text-gray-600 transition hover:text-[#F5B700]"
                >
                  AI Notes
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-fit text-xs text-gray-600 transition hover:text-[#F5B700]"
                >
                  Features
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("subjects")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-fit text-xs text-gray-600 transition hover:text-[#F5B700]"
                >
                  Subjects
                </button>
              </div>
            </div>

            {/* EXPLORE */}

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">
                Explore
              </p>

              <div className="mt-4 flex flex-col gap-3">

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-fit text-xs text-gray-600 transition hover:text-[#F5B700]"
                >
                  Why Kivraa
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("subjects")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-fit text-xs text-gray-600 transition hover:text-[#F5B700]"
                >
                  Explore subjects
                </button>

                <button
                  type="button"
                  onClick={() =>
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                  className="w-fit text-xs text-gray-600 transition hover:text-[#F5B700]"
                >
                  Back to top ↑
                </button>

              </div>
            </div>

          </div>

          {/* DIVIDER */}

          <div className="my-8 h-px bg-white/[0.06]" />

          {/* BOTTOM */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-[10px] text-gray-700">
              © {new Date().getFullYear()} Kivraa. All rights reserved.
            </p>

            <div className="flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-[#F5B700]" />

              <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-gray-700">
                Built for better learning
              </span>

            </div>

          </div>

        </div>
      </footer>

    </main>
  );
}