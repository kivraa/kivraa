"use client";

import Link from "next/link";

const navItems = [
  { label: "Discover", href: "/categories" },
  { label: "AI Notes", href: "/upload" },
  { label: "My Notes", href: "/my-notes" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090D]/90 backdrop-blur-2xl">
      <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LOGO */}

        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#F5B700] text-xl font-black text-black transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(245,183,0,0.18)]">
            K
          </div>

          <div className="hidden sm:block">
            <div className="text-[19px] font-black leading-none tracking-[-0.045em] text-white">
              kivraa
            </div>

            <div className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.22em] text-gray-600">
              Study smarter
            </div>
          </div>
        </Link>

        {/* NAVIGATION */}

        <div className="hidden items-center rounded-xl border border-white/[0.05] bg-white/[0.02] p-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg px-4 py-2 text-[12px] font-semibold text-gray-500 transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-2">

          <Link
            href="/auth"
            className="hidden rounded-lg px-3 py-2 text-[12px] font-semibold text-gray-500 transition-colors hover:text-white sm:block"
          >
            Sign in
          </Link>

          <Link
            href="/upload"
            className="group flex items-center gap-2 rounded-xl bg-[#F5B700] px-4 py-2.5 text-[12px] font-black text-black transition-all duration-200 hover:bg-[#FFD23F] hover:shadow-[0_8px_28px_rgba(245,183,0,0.16)] active:scale-[0.98]"
          >
            <span className="hidden sm:inline">
              Create Notes
            </span>

            <span className="sm:hidden">
              Create
            </span>

            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>

        </div>

      </div>
    </nav>
  );
}