import type { Config } from "tailwindcss";

/**
 * LVY design tokens — Phase 1 foundation.
 * Source of truth: docs/design.md + docs/brand-rules.md (derived from the Brand Book).
 *
 * Backwards-compatible by design:
 *  - Existing brand color names are kept (cream, sand, terracotta, walnut, charcoal, sage, muted).
 *  - `terracotta` and `sage` are RE-POINTED to the Brand Book's canonical hex values.
 *  - New brand + semantic tokens are added (additive, non-breaking).
 *  - Colors stay as hex literals so Tailwind opacity modifiers (e.g. bg-charcoal/10,
 *    bg-terracotta/90, text-cream/60) continue to work unchanged.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        // ── Brand foundation (warm neutrals) ──
        cream: "#F6F1EA", // page background
        sand: "#EADFCE", // subtle surfaces / hovers
        charcoal: "#1C1B19", // primary text / dark sections
        walnut: "#5B3A21", // deep accent / pressed states
        stone: "#8B847C", // muted / secondary text
        muted: "#8B847C", // alias of stone (kept for existing classes)

        // ── True black / white ──
        ink: "#000000",
        paper: "#FFFFFF",

        // ── Brand palette (Brand Book canonical) ──
        terracotta: "#83382E", // primary accent  (was #C2613B)
        sage: "#708058", // secondary accent (was #8A9A82)
        clay: "#A38270", // tertiary / warm accent (new)

        // ── Semantic tokens (additive) ──
        primary: "#83382E", // terracotta
        secondary: "#708058", // sage
        accent: "#A38270", // clay
        background: "#F6F1EA", // cream
        surface: "#FFFFFF", // white
        foreground: "#1C1B19", // charcoal (text)
        border: "#DCD7D1", // charcoal ~12% over cream — hairline divider
        success: "#708058", // sage
        warning: "#A38270", // clay
        destructive: "#83382E", // terracotta
      },
      fontFamily: {
        display: ['"Instrument Serif"', "serif"],
        sans: ['"Instrument Sans"', "system-ui", "sans-serif"],
      },
      // Additive semantic type scale (does not override default text-* sizes).
      fontSize: {
        eyebrow: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.3em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        h3: ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        h2: ["clamp(2rem, 3.5vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        h1: ["clamp(2.5rem, 5vw, 4rem)", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
        display: ["clamp(3rem, 7vw, 6rem)", { lineHeight: "1.02", letterSpacing: "-0.04em" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        eyebrow: "0.3em",
      },
      // Radius scale — single system (docs/design.md §6). Pills via rounded-full.
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "16px",
      },
      // Warm, diffuse elevation (docs/design.md §7). No pure-black shadows.
      boxShadow: {
        xs: "0 1px 2px rgba(28,27,25,0.04)",
        sm: "0 2px 8px rgba(28,27,25,0.06)",
        md: "0 8px 30px rgba(28,27,25,0.08)",
        lg: "0 24px 60px rgba(28,27,25,0.10)",
      },
      // Named spacing aligned to the 4px scale (additive helpers).
      spacing: {
        section: "8rem", // 128px — large section rhythm
      },
      transitionTimingFunction: { soft: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [],
} satisfies Config;
