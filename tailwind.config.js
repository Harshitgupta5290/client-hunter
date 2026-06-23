/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#111118",
          tertiary: "#1a1a2e",
        },
        accent: {
          purple: "#6366f1",
          violet: "#8b5cf6",
          green: "#22c55e",
          amber: "#f59e0b",
          red: "#ef4444",
          blue: "#3b82f6",
        },
        text: {
          primary: "#f0f0f6",
          secondary: "#b8b8cc",
          muted: "#8888a8",
          dim: "#5a5a78",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'SF Mono'", "'Fira Code'", "monospace"],
        display: ["'Space Grotesk'", "sans-serif"],
      },
      animation: {
        "slide-in": "slideIn 0.3s ease forwards",
        pulse: "pulse 1.5s ease-in-out infinite",
      },
      keyframes: {
        slideIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
