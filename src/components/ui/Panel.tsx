import type { ReactNode, HTMLAttributes } from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  /** @deprecated kept for compatibility — visual handled by the card style */
  scanlines?: boolean;
  children: ReactNode;
}

/** Washi paper card */
export default function Panel({ className = "", children, scanlines: _scanlines, ...rest }: PanelProps) {
  return (
    <div className={`rounded-blob border border-seam bg-hull shadow-soft backdrop-blur-sm ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function PanelHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-t-blob border-b border-seam bg-white/60 px-4 py-2.5">
      <span className="font-display text-xs font-bold uppercase tracking-[0.25em] text-plasma">{children}</span>
      <span className="h-2 w-2 rounded-full bg-plasma/70" aria-hidden />
    </div>
  );
}
