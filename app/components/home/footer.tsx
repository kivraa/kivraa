"use client";

const footerLinks = {
  Product: [
    { label: "AI Notes", href: "#generator" },
    { label: "Features", href: "#features" },
    { label: "Subjects", href: "#subjects" },
  ],
  Resources: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Study smarter", href: "#features" },
    { label: "Explore subjects", href: "#subjects" },
  ],
};

export default function Footer() {
  const scrollTo = (href: string) => {
    if (href.startsWith("#")) {
      document
        .getElementById(href.slice(1))
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#08080B]">

      {/* subtle glow */}

      <div className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[500px] -translate-x-1/2 rounded-full bg-[#F5B700]/[0.025] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8">

        {/* MAIN */}

        <div className="grid gap-9 md:grid-cols-[1.5fr_1fr_1fr]">

          {/* BRAND */}

          <div className="max-w-sm">

            <button
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="group flex items-center gap-2.5"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5B700] text-lg font-black text-black shadow-[0_0_25px_rgba(245,183,0,0.12)] transition-transform duration-200 group-hover:scale-105">
                K
              </div>

              <span className="text-xl font-black tracking-[-0.04em] text-white">
                Kivraa
              </span>

            </button>

            <p className="mt-4 text-sm leading-6 text-gray-600">
              Turn difficult topics into notes that are easier to
              understand, remember and revise.
            </p>

            <button
              onClick={() =>
                scrollTo("#generator")
              }
              className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F5B700] px-4 py-2.5 text-xs font-bold text-black transition-all duration-200 hover:bg-[#FFD23F] hover:shadow-[0_0_25px_rgba(245,183,0,0.14)]"
            >
              Start learning

              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </button>

          </div>

          {/* PRODUCT */}

          <div>

            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">
              Product
            </p>

            <div className="mt-4 flex flex-col gap-2.5">

              {footerLinks.Product.map(
                (link) => (
                  <button
                    key={link.label}
                    onClick={() =>
                      scrollTo(link.href)
                    }
                    className="w-fit text-left text-xs text-gray-600 transition-colors hover:text-[#F5B700]"
                  >
                    {link.label}
                  </button>
                )
              )}

            </div>

          </div>

          {/* RESOURCES */}

          <div>

            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">
              Explore
            </p>

            <div className="mt-4 flex flex-col gap-2.5">

              {footerLinks.Resources.map(
                (link) => (
                  <button
                    key={link.label}
                    onClick={() =>
                      scrollTo(link.href)
                    }
                    className="w-fit text-left text-xs text-gray-600 transition-colors hover:text-[#F5B700]"
                  >
                    {link.label}
                  </button>
                )
              )}

            </div>

          </div>

        </div>

        {/* DIVIDER */}

        <div className="my-8 h-px bg-white/[0.06]" />

        {/* BOTTOM */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-[10px] text-gray-700">
            © {new Date().getFullYear()} Kivraa. Learn smarter.
          </p>

          <div className="flex items-center gap-3">

            <span className="h-1 w-1 rounded-full bg-[#F5B700]/60" />

            <span className="text-[10px] uppercase tracking-[0.16em] text-gray-700">
              Built for better learning
            </span>

          </div>

        </div>

      </div>
    </footer>
  );
}