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

/** Editorial underline tabs — active tab carries a vermilion rule */
export default function Tabs({ tabs, active, onChange, right, className = "" }: TabsProps) {
  return (
    <div
      className={`flex items-center gap-5 border-b border-seam px-1 ${className}`}
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
            className={`-mb-px whitespace-nowrap border-b-2 px-1 pb-2.5 pt-2 font-display text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
              isActive
                ? "border-plasma text-plasma"
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
