import type { ReactNode } from "react";
import { sfx } from "@/lib/sfx";

export interface TabDef {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
  /** Optional slot on the right (close button, badge, etc.) */
  right?: ReactNode;
  className?: string;
}

/**
 * Console-style tab strip — chunky rectangular tabs, active tab lights up
 * white like a selected game menu. Inspired by classic game panel UIs.
 */
export default function Tabs({ tabs, active, onChange, right, className = "" }: TabsProps) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-t-blob border-b-2 border-[#aebbdd]/60 bg-hullraised px-2 pt-2 ${className}`}
      role="tablist"
    >
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              if (!isActive) sfx.blip();
              onChange(t.id);
            }}
            className={`-mb-0.5 whitespace-nowrap rounded-t-lg border-x-2 border-t-2 px-4 py-1.5 font-display text-[11px] font-extrabold uppercase tracking-[0.2em] transition-colors ${
              isActive
                ? "border-[#aebbdd]/60 bg-hull text-ink"
                : "border-transparent text-inkdim hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        );
      })}
      {right && <div className="ml-auto pr-1">{right}</div>}
    </div>
  );
}
