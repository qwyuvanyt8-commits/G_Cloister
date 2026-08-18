"use client";

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/* ---------- Logo ---------- */
export function Logo({
  size = 34,
  withWordmark = true,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex select-none items-center", className)}>
      <span
        className="flex items-center bg-gc-cobalt px-2 py-1 text-paper"
        style={{ fontSize: size * 0.42 }}
      >
        <span className="font-black leading-none tracking-tight">G_</span>
      </span>
      {withWordmark && (
        <span
          className="hidden items-center border-2 border-gc-ink px-2 py-1 text-gc-ink sm:flex"
          style={{ fontSize: size * 0.42 }}
        >
          <span className="font-black leading-none tracking-tight">CLOISTER</span>
        </span>
      )}
    </span>
  );
}

/* ---------- Button ---------- */
type BtnVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const btnVariants: Record<BtnVariant, string> = {
  primary:
    "bg-gc-cobalt text-paper border-2 border-gc-ink shadow-[3px_3px_0_#16130d] hover:bg-gc-cobalt-dark active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  secondary:
    "bg-paper text-gc-ink border-2 border-gc-ink hover:border-gc-cobalt hover:text-gc-cobalt active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
  ghost:
    "text-gc-muted hover:text-gc-ink hover:bg-paper-2 active:scale-[0.98]",
  danger:
    "bg-gc-orange text-paper border-2 border-gc-ink shadow-[2px_2px_0_#16130d] hover:bg-gc-orange-dark active:scale-[0.98]",
};

const btnSizes = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, icon, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center rounded-none font-extrabold uppercase tracking-tight transition-all duration-150 whitespace-nowrap",
        "disabled:opacity-50 disabled:pointer-events-none",
        btnVariants[variant],
        btnSizes[size],
        className
      )}
      {...props}
    >
      {loading ? <Spinner size={16} /> : icon}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export function IconButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-none border-2 border-transparent text-gc-muted transition-colors",
        "hover:border-gc-ink hover:bg-paper-2 hover:text-gc-ink active:scale-95",
        className
      )}
      {...props}
    />
  );
}

/* ---------- Input ---------- */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  mono?: boolean;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, mono, icon, trailing, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="font-space-mono text-[11px] font-bold uppercase tracking-[0.14em] text-gc-muted"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-faint">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-12 rounded-none bg-paper border-2 border-gc-ink px-4 text-[15px] text-gc-ink placeholder:text-gc-faint",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-gc-cobalt/25 focus:border-gc-cobalt",
              mono && "font-space-mono tracking-tight",
              error ? "border-gc-orange" : "hover:border-gc-cobalt",
              icon ? "pl-11" : undefined,
              trailing ? "pr-12" : undefined,
              className
            )}
            {...props}
          />
          {trailing && (
            <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>
          )}
        </div>
        {error ? (
          <p className="text-[13px] font-semibold text-gc-orange">{error}</p>
        ) : hint ? (
          <p className="text-[13px] text-gc-faint">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

/* ---------- Avatar ---------- */
export function Avatar({
  name,
  src,
  size = 32,
  online,
  ring = false,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  online?: boolean;
  ring?: boolean;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span className={cn("relative inline-flex shrink-0", className)} style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatars are remote (Google), not in the image optimizer
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className={cn(
            "rounded-full object-cover",
            ring && "ring-2 ring-surface"
          )}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span
          className={cn(
            "flex items-center justify-center rounded-full font-bold text-[calc(var(--s)*0.4)]",
            "bg-gc-cobalt/10 text-gc-cobalt",
            ring && "ring-2 ring-paper"
          )}
          style={{ "--s": size, width: size, height: size, fontSize: size * 0.4 } as React.CSSProperties}
        >
          {initials}
        </span>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-paper",
            online ? "bg-gc-cobalt" : "bg-gc-faint/60"
          )}
        />
      )}
    </span>
  );
}

/* ---------- Spinner ---------- */
export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("animate-spin", className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------- Kbd / mono chip ---------- */
export function MonoChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none bg-paper-2 border-2 border-dashed border-gc-ink px-2.5 py-1 font-space-mono text-[13px] tracking-tight text-gc-ink",
        className
      )}
    >
      {children}
    </span>
  );
}
