import type { Config } from "tailwindcss";

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
        cream: "#F6F1EA",
        sand: "#EADFCE",
        terracotta: "#C2613B",
        walnut: "#5B3A21",
        charcoal: "#1C1B19",
        sage: "#8A9A82",
        muted: "#8B847C",
      },
      fontFamily: {
        display: ['"Instrument Serif"', "serif"],
        sans: ['"Instrument Sans"', "system-ui", "sans-serif"],
      },
      letterSpacing: { tightest: "-0.04em" },
      transitionTimingFunction: { soft: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [],
} satisfies Config;
