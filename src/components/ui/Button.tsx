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
  primary: "bg-plasma text-void btn-3d hover:brightness-110",
  warm: "bg-accent-warm text-void btn-3d hover:brightness-110",
  ghost: "bg-hullraised text-ink border-2 border-[#aebbdd]/70 btn-3d hover:border-plasma",
  danger: "bg-alert text-white btn-3d hover:brightness-110",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

/** Chunky tactile game button — presses down like a console key */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", to, className = "", children, onClick, disabled, ...rest },
  ref
) {
  const cls = `inline-flex select-none items-center justify-center gap-2 rounded-full font-display font-extrabold uppercase tracking-wider transition-all duration-100 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  /** Tactile console click on every button press */
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
