"use client";

import { useEffect, useRef } from "react";

/* ────────────────────────────────────────────────────────────────
 * KivraaLogo — approved Kivraa artwork (two overlapping panels:
 * sunset-yellow front, warm-cream rear), rendered 1:1 from the
 * source-of-truth PNG in /public/logo.
 *
 *  • KivraaLogoStatic   → static logo (navbar, footer, auth, notes)
 *  • KivraaLogoAnimated → formation + glow + float loop (loading)
 *  • respects prefers-reduced-motion (shows static in both modes)
 * ──────────────────────────────────────────────────────────────── */

const MASTER = "/logo/kivraa-logo.png";

/* Static logo ─────────────────────────────────────────────── */
export function KivraaLogoStatic({
  className = "",
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <img
        src={MASTER}
        alt="Kivraa"
        draggable={false}
        className="block h-full w-full select-none"
      />
    </div>
  );
}

/* Animated logo (loading / hero) ──────────────────────────── */
export function KivraaLogoAnimated({
  className = "",
  size,
  playing = true,
}: {
  className?: string;
  size?: number;
  playing?: boolean;
}) {
  const creamRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return; // show static

    const cream = creamRef.current;
    const yellow = yellowRef.current;
    const glow = glowRef.current;
    if (!cream || !yellow || !glow) return;

    /* ── Formation ── */
    const FORM_DUR = 1600;

    const stageInitial = () => {
      // cream starts right, blurred
      cream.style.opacity = "0";
      cream.style.filter = "blur(6px)";
      cream.style.transition = "none";
      cream.style.transform = "translate(12px, -6px)";

      // yellow starts left, blurred
      yellow.style.opacity = "0";
      yellow.style.filter = "blur(6px)";
      yellow.style.transition = "none";
      yellow.style.transform = "translate(-12px, 8px)";

      // glow hidden
      glow.style.opacity = "0";
      glow.style.transition = "none";
      glow.style.transform = "scale(1)";
    };

    const stageFormed = () => {
      const dur = FORM_DUR + "ms";
      const ease = "cubic-bezier(0.22, 0.8, 0.2, 1)";

      cream.style.transition = `all ${dur} ${ease}`;
      yellow.style.transition = `all ${dur} ${ease} 120ms`;
      glow.style.transition = "all 480ms ease-out";

      cream.style.opacity = "1";
      cream.style.filter = "blur(0)";
      cream.style.transform = "translate(0, 0)";

      yellow.style.opacity = "1";
      yellow.style.filter = "blur(0)";
      yellow.style.transform = "translate(0, 0)";
    };

    stageInitial();

    /* Let the initial (separated, blurred) state paint first — only then
       flip to the final state so the CSS transition animates the entrance. */
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        stageFormed();
      });
    });

    /* glow ripple after formation */
    const glowTimer = setTimeout(() => {
      glow.style.opacity = "1";
      glow.style.transform = "scale(1.08)";

      setTimeout(() => {
        glow.style.opacity = "0";
        glow.style.transform = "scale(1)";
      }, 520);
    }, FORM_DUR - 300);

    /* ── Float loop (GPU-friendly CSS keyframes) ── */
    const floatTimer = setTimeout(() => {
      cream.style.transition = "none";
      yellow.style.transition = "none";
      cream.classList.add("kivraa-logo-float-cream");
      yellow.classList.add("kivraa-logo-float-yellow");
    }, FORM_DUR + 180);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(glowTimer);
      clearTimeout(floatTimer);
    };
  }, [playing]);

  return (
    <div
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes kivraa-cream-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.6px); }
        }
        @keyframes kivraa-yellow-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(1.5px); }
        }
        .kivraa-logo-float-cream { animation: kivraa-cream-float 3.4s ease-in-out infinite; }
        .kivraa-logo-float-yellow { animation: kivraa-yellow-float 3.4s ease-in-out 0.09s infinite; }
        @media (prefers-reduced-motion: reduce) {
          .kivraa-logo-float-cream, .kivraa-logo-float-yellow { animation: none; }
        }
      `,
        }}
      />

      {/* warm glow layer */}
      <div
        ref={glowRef}
        style={{ opacity: 0 }}
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "radial-gradient(circle, rgba(245,183,0,0.35) 0%, rgba(245,183,0,0.14) 42%, rgba(245,183,0,0) 70%)",
            filter: "blur(4px)",
          }}
        />
      </div>

      {/* rear (cream) layer */}
      <div
        ref={creamRef}
        className="absolute inset-0"
        style={{ willChange: "transform, opacity, filter" }}
      >
        <img
          src="/logo/kivraa-logo-cream.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="block h-full w-full select-none"
        />
      </div>

      {/* front (yellow) layer */}
      <div
        ref={yellowRef}
        className="absolute inset-0"
        style={{ willChange: "transform, opacity, filter" }}
      >
        <img
          src="/logo/kivraa-logo-yellow.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="block h-full w-full select-none"
        />
      </div>
    </div>
  );
}

export default KivraaLogoStatic;