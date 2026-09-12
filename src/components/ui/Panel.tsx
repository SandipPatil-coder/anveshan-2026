import type { ReactNode, HTMLAttributes } from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  /** @deprecated kept for compatibility — visual handled by rounded style */
  scanlines?: boolean;
  children: ReactNode;
}

/** Rounded space-station panel */
export default function Panel({ className = "", children, ...rest }: PanelProps) {
  return (
    <div className={`rounded-blob border-2 border-[#aebbdd]/70 bg-hull backdrop-blur-md ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function PanelHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-t-blob border-b-2 border-[#aebbdd]/60 bg-hullraised px-4 py-2.5">
      <span className="font-display text-xs font-extrabold uppercase tracking-[0.25em] text-plasma">{children}</span>
      <span className="flex gap-1.5" aria-hidden>
        <i className="block h-2 w-2 rounded-full bg-signet/80" />
        <i className="block h-2 w-2 rounded-full bg-accent-warm/80" />
        <i className="block h-2 w-2 rounded-full bg-alert/80" />
      </span>
    </div>
  );
}
