"use client";

import { useState } from "react";

const navItems = [
  {
    label: "Discover",
    href: "#subjects",
  },
  {
    label: "AI Notes",
    href: "#generator",
  },
  {
    label: "My Notes",
    href: "#my-notes",
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToGenerator = () => {
    document.getElementById("generator")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      {/* Background */}
      <div className="absolute inset-0 border-b border-white/[0.06] bg-[#0B0B0F]/85 backdrop-blur-xl" />

      <div className="relative mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 sm:px-7 lg:px-10">
        {/* =====================================================
            LOGO
        ===================================================== */}
        <a
          href="/"
          className="group flex items-center gap-3"
          aria-label="Kivraa home"
        >
          {/* K Mark */}
          <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#F5B700] text-[20px] font-black text-black shadow-[0_8px_24px_rgba(245,183,0,0.08)] transition-all duration-200 group-hover:-translate-y-[1px] group-hover:shadow-[0_10px_28px_rgba(245,183,0,0.14)]">
            K
          </div>

          {/* Wordmark */}
          <div className="flex flex-col leading-none">
            <span className="text-[19px] font-black tracking-[-0.03em] text-white">
              kivraa
            </span>

            <span className="mt-[5px] text-[9px] font-medium uppercase tracking-[0.22em] text-[#596070]">
              study smarter
            </span>
          </div>
        </a>

        {/* =====================================================
            DESKTOP NAV
        ===================================================== */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="
                relative rounded-lg px-4 py-2.5
                text-[14px] font-medium text-[#8A93A5]
                transition-all duration-200
                hover:bg-white/[0.035]
                hover:text-white
              "
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}
        <div className="hidden items-center gap-5 md:flex">
          {/* Sign In */}
          <button
            className="
              px-1 py-2
              text-[14px] font-medium text-[#747D90]
              transition-colors duration-200
              hover:text-white
            "
          >
            Sign in
          </button>

          {/* Primary CTA */}
          <button
            onClick={scrollToGenerator}
            className="
              rounded-[12px]
              bg-[#F5B700]
              px-[18px] py-[11px]
              text-[14px] font-bold text-black
              transition-all duration-200
              hover:bg-[#FFC928]
              hover:-translate-y-[1px]
              hover:shadow-[0_10px_28px_rgba(245,183,0,0.13)]
              active:translate-y-0
              active:scale-[0.98]
            "
          >
            Create Notes
          </button>
        </div>

        {/* =====================================================
            MOBILE MENU BUTTON
        ===================================================== */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-[11px]
            border border-white/[0.07]
            bg-white/[0.025]
            text-[#AAB2C2]
            transition-all duration-200
            hover:border-white/[0.12]
            hover:bg-white/[0.05]
            hover:text-white
            md:hidden
          "
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <div className="flex flex-col gap-[5px]">
            <span
              className={`block h-[1.5px] w-[17px] bg-current transition-all duration-200 ${
                menuOpen
                  ? "translate-y-[6.5px] rotate-45"
                  : ""
              }`}
            />

            <span
              className={`block h-[1.5px] w-[17px] bg-current transition-all duration-200 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />

            <span
              className={`block h-[1.5px] w-[17px] bg-current transition-all duration-200 ${
                menuOpen
                  ? "-translate-y-[6.5px] -rotate-45"
                  : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* =====================================================
          MOBILE NAV
      ===================================================== */}
      {menuOpen && (
        <div
          className="
            relative
            border-t border-white/[0.05]
            bg-[#0B0B0F]/95
            px-5 pb-5 pt-3
            backdrop-blur-xl
            md:hidden
          "
        >
          <nav className="mx-auto flex max-w-[1400px] flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="
                  rounded-[11px]
                  px-4 py-3
                  text-[14px] font-medium text-[#8A93A5]
                  transition-all duration-200
                  hover:bg-white/[0.04]
                  hover:text-white
                "
              >
                {item.label}
              </a>
            ))}

            <div className="my-2 h-px bg-white/[0.06]" />

            {/* Mobile Sign In */}
            <button
              className="
                rounded-[11px]
                px-4 py-3
                text-left
                text-[14px] font-medium text-[#747D90]
                transition-colors duration-200
                hover:bg-white/[0.035]
                hover:text-white
              "
            >
              Sign in
            </button>

            {/* Mobile CTA */}
            <button
              onClick={() => {
                setMenuOpen(false);
                scrollToGenerator();
              }}
              className="
                mt-1
                rounded-[11px]
                bg-[#F5B700]
                px-4 py-3
                text-[14px] font-bold text-black
                transition-all duration-200
                hover:bg-[#FFC928]
                active:scale-[0.98]
              "
            >
              Create Notes
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}