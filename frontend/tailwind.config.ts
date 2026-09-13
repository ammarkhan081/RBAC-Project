import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0f1d",
          secondary: "#111827",
          card: "rgba(17, 24, 39, 0.75)",
        },
        accent: {
          cyan: "#06b6d4",
          indigo: "#6366f1",
          purple: "#a855f7",
        },
        status: {
          sql: "#10b981",
          rag: "#3b82f6",
          hybrid: "#8b5cf6",
          blocked: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
export default config;