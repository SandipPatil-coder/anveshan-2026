import { forwardRef, type ButtonHTMLAttributes, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { sfx } from "@/lib/sfx";

type Variant = "primary" | "ghost" | "warm" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  to?: string;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-plasma text-white hover:bg-accent-deep",
  warm: "bg-accent-warm text-white hover:brightness-110",
  ghost: "bg-white/70 text-ink border border-seam hover:border-plasma hover:text-plasma",
  danger: "bg-alert text-white hover:brightness-110",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

/** Editorial pill button — quiet press, soft shadow */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", to, className = "", children, onClick, disabled, ...rest },
  ref
) {
  const cls = `inline-flex select-none items-center justify-center gap-2 rounded-full font-display font-bold shadow-sm transition-all duration-150 active:translate-y-px active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!disabled) sfx.blip();
    onClick?.(e);
  };

  if (to) {
    return (
      <Link to={to} className={cls} onClick={() => !disabled && sfx.blip()}>
        {children}
      </Link>
    );
  }
  return (
    <button ref={ref} className={cls} onClick={handleClick} disabled={disabled} {...rest}>
      {children}
    </button>
  );
});

export default Button;
