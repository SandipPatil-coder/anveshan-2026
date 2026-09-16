import type { InputHTMLAttributes, ReactNode } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
}

/** Labeled form input — paper card style */
export default function Field({ label, hint, className = "", id, ...rest }: FieldProps) {
  const inputId = id ?? `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-inkdim">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-xl border border-seam bg-white px-3.5 py-2.5 text-base font-semibold text-ink caret-[#c73e3a] placeholder:font-medium placeholder:text-inkdim/70 focus:border-plasma focus:outline-none focus:ring-2 focus:ring-plasma/25 ${className}`}
        {...rest}
      />
      {hint ? <p className="mt-1 text-[11px] font-medium text-inkdim/90">{hint}</p> : null}
    </div>
  );
}
