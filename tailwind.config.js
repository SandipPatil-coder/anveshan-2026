/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Shippori Mincho B1"', '"Noto Serif JP"', "ui-serif", "serif"],
        sans: ['"Zen Kaku Gothic New"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        void: "var(--background)",
        hull: "var(--surface)",
        hullraised: "var(--surface-elevated)",
        ink: "var(--text)",
        inkdim: "var(--text-muted)",
        plasma: "var(--accent)",
        signet: "var(--success)",
        caution: "var(--warning)",
        alert: "var(--danger)",
        seam: "var(--border)",
        "accent-warm": "var(--accent-warm)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(35, 32, 40, 0.05), 0 10px 30px rgba(35, 32, 40, 0.08)",
        glow: "0 0 18px rgba(199, 62, 58, 0.22)",
        glowlg: "0 0 32px rgba(199, 62, 58, 0.28)",
        amber: "0 0 18px rgba(169, 123, 47, 0.28)",
      },
      borderRadius: {
        blob: "18px",
      },
    },
  },
  plugins: [],
};
