/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"M PLUS Rounded 1c"', "Nunito", "ui-sans-serif", "sans-serif"],
        sans: ['"Nunito"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Nunito"', "ui-monospace", "monospace"],
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
        glow: "0 0 22px rgba(255, 171, 94, 0.3)",
        glowlg: "0 0 48px rgba(255, 171, 94, 0.4)",
        amber: "0 0 22px rgba(255, 209, 102, 0.3)",
      },
      borderRadius: {
        blob: "18px",
      },
    },
  },
  plugins: [],
};
