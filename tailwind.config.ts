import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas:  "#0a0a0a",
        surface: "#111111",
        card:    "#161616",
        border:  "#222222",
        frost:   "#f3f3f3",
        muted:   "#888888",
        amber:   "#e7c59a",
        "amber-bright": "#f0d0a8",
      },
      fontFamily: {
        heading: ["var(--font-archivo)", "sans-serif"],
        body:    ["var(--font-space-grotesk)", "sans-serif"],
        mono:    ["var(--font-jetbrains-mono)", "monospace"],
      },
      animation: {
        "spotlight": "spotlight 2s ease .75s 1 forwards",
        "marquee":   "marquee 30s linear infinite",
        "marquee-rev": "marquee-rev 30s linear infinite",
      },
      keyframes: {
        spotlight: {
          "0%":   { opacity: "0", transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: "1", transform: "translate(-50%, -40%) scale(1)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
        "marquee-rev": {
          from: { transform: "translateX(-50%)" },
          to:   { transform: "translateX(0)" },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
