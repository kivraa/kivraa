"use client";

import { useEffect, useRef } from "react";

/* ────────────────────────────────────────────────────────────────
 * KivraaLogo — two overlapping sharp/tilted panels
 *
 *  • "normal"  → static logo, uses CSS animation classes
 *  • "loading" → formation + float loop via JS-driven keyframes
 *  • respects prefers-reduced-motion (shows static in both modes)
 * ──────────────────────────────────────────────────────────────── */

function Panels({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="kivraa-cream-grad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#F2ECE0" />
          <stop offset="100%" stopColor="#E2DCCE" />
        </linearGradient>
        <linearGradient
          id="kivraa-yellow-grad"
          x1="25%"
          y1="0%"
          x2="75%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#F5B700" />
          <stop offset="100%" stopColor="#E0A400" />
        </linearGradient>
        <filter id="kivraa-panel-shadow">
          <feDropShadow
            dx="0"
            dy="0.6"
            stdDeviation="1"
            floodColor="#000"
            floodOpacity="0.18"
          />
        </filter>
      </defs>

      {/* Rear panel — cream */}
      <g filter="url(#kivraa-panel-shadow)">
        <rect
          x="11"
          y="5.5"
          width="15.5"
          height="12.5"
          fill="url(#kivraa-cream-grad)"
          transform="rotate(9 18.75 11.75)"
        />
        {/* subtle yellow reflection on the cream surface */}
        <rect
          x="15"
          y="8"
          width="7"
          height="5"
          fill="#F5B700"
          opacity="0.1"
          transform="rotate(9 18.5 10.5)"
        />
      </g>

      {/* Front panel — yellow */}
      <g filter="url(#kivraa-panel-shadow)">
        <rect
          x="5"
          y="13"
          width="15.5"
          height="12.5"
          fill="url(#kivraa-yellow-grad)"
          transform="rotate(-4 12.75 19.25)"
        />
      </g>
    </svg>
  );
}

/* ── Static logo ─────────────────────────────────────────────── */
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
      <Panels className="h-full w-full" />
    </div>
  );
}

/* ── Animated logo (loading / hero) ──────────────────────────── */
export function KivraaLogoAnimated({
  className = "",
  size,
  playing = true,
}: {
  className?: string;
  size?: number;
  playing?: boolean;
}) {
  const creamRef = useRef<SVGGElement>(null);
  const yellowRef = useRef<SVGGElement>(null);
  const glowRef = useRef<SVGGElement>(null);

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
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="kivraa-cream-grad-a"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#F2ECE0" />
            <stop offset="100%" stopColor="#E2DCCE" />
          </linearGradient>
          <linearGradient
            id="kivraa-yellow-grad-a"
            x1="25%"
            y1="0%"
            x2="75%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#F5B700" />
            <stop offset="100%" stopColor="#E0A400" />
          </linearGradient>
          <filter id="kivraa-shadow-a">
            <feDropShadow
              dx="0"
              dy="0.6"
              stdDeviation="1"
              floodColor="#000"
              floodOpacity="0.18"
            />
          </filter>
          <filter id="kivraa-glow-a">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* Warm glow behind the logo */}
        <g ref={glowRef} style={{ opacity: 0 }}>
          <ellipse
            cx="16"
            cy="17"
            rx="14"
            ry="12"
            fill="#F5B700"
            filter="url(#kivraa-glow-a)"
            opacity="0.35"
          />
        </g>

        {/* Rear panel — cream */}
        <g ref={creamRef} filter="url(#kivraa-shadow-a)">
          <rect
            x="11"
            y="5.5"
            width="15.5"
            height="12.5"
            fill="url(#kivraa-cream-grad-a)"
            transform="rotate(9 18.75 11.75)"
          />
          <rect
            x="15"
            y="8"
            width="7"
            height="5"
            fill="#F5B700"
            opacity="0.1"
            transform="rotate(9 18.5 10.5)"
          />
        </g>

        {/* Front panel — yellow */}
        <g ref={yellowRef} filter="url(#kivraa-shadow-a)">
          <rect
            x="5"
            y="13"
            width="15.5"
            height="12.5"
            fill="url(#kivraa-yellow-grad-a)"
            transform="rotate(-4 12.75 19.25)"
          />
        </g>
      </svg>
    </div>
  );
}

export default KivraaLogoStatic;
