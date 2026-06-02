import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        coal: "#0a0f16",
        panel: "#111927",
        panelSoft: "#162233",
        steel: "#8ea0b8",
        amber: "#f5b84b",
        profit: "#35d28a",
        loss: "#ff5c70",
        caution: "#ffd166",
      },
      boxShadow: {
        glow: "0 0 40px rgba(245, 184, 75, 0.12)",
        panel: "0 22px 70px rgba(0, 0, 0, 0.35)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
