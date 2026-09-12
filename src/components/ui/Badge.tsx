import type { ReactNode } from "react";

type Tone = "open" | "closed" | "pending" | "neutral" | "danger";

const tones: Record<Tone, string> = {
  open: "bg-signet/15 text-signet border-signet/60",
  closed: "bg-alert/15 text-alert border-alert/60",
  pending: "bg-accent-warm/15 text-accent-warm border-accent-warm/60",
  neutral: "bg-plasma/15 text-plasma border-plasma/50",
  danger: "bg-alert/20 text-alert border-alert/70",
};

export default function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-display text-[10px] font-extrabold uppercase tracking-[0.15em] ${tones[tone]}`}
    >
      {tone === "open" && <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-signet" aria-hidden />}
      {children}
    </span>
  );
}
