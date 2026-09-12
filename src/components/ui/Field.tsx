import type { InputHTMLAttributes, ReactNode } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
}

/** Labeled station-console input */
export default function Field({ label, hint, className = "", id, ...rest }: FieldProps) {
  const inputId = id ?? `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block font-display text-[11px] font-extrabold uppercase tracking-[0.2em] text-inkdim">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-xl border-2 border-[#aebbdd]/70 bg-[#0b1120] px-3.5 py-2.5 text-base font-bold text-ink caret-[#4cc9f0] placeholder:font-semibold placeholder:text-inkdim/80 focus:border-plasma focus:outline-none focus:ring-2 focus:ring-plasma/30 ${className}`}
        {...rest}
      />
      {hint ? <p className="mt-1 font-display text-[11px] font-bold text-inkdim/90">{hint}</p> : null}
    </div>
  );
}
