/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 태웅 스마트 팩토리 팔레트 — 딥 블루/슬레이트 그레이
        factory: {
          50:  "#f0f4fa",
          100: "#d9e4f5",
          200: "#a8c2e8",
          300: "#6d9fd8",
          400: "#3b7dc4",
          500: "#1e5faa",
          600: "#164d8f",
          700: "#103b72",
          800: "#0b2a55",
          900: "#061b38",
          950: "#030e1f",
        },
        slate: {
          750: "#293548",
        },
        status: {
          draft:    "#64748b",
          review:   "#d97706",
          approved: "#16a34a",
        },
        capa: {
          ok:   "#16a34a",
          warn: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "factory-gradient":
          "linear-gradient(135deg, #030e1f 0%, #0b2a55 50%, #103b72 100%)",
        "card-shine":
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
      },
      boxShadow: {
        "factory-glow": "0 0 20px rgba(30, 95, 170, 0.3)",
        "card-dark": "0 4px 24px rgba(0,0,0,0.4)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-red": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(239,68,68,0.4)" },
          "50%":       { boxShadow: "0 0 0 6px rgba(239,68,68,0)" },
        },
        shimmer: {
          "0%"  : { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
      animation: {
        "fade-in":   "fade-in 0.35s ease-out both",
        "pulse-red": "pulse-red 2s infinite",
        shimmer:     "shimmer 1.8s infinite linear",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
