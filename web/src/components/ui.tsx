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
        className="flex items-center rounded-md bg-gc-cobalt text-white shadow-[0_2px_10px_-2px_rgba(68,86,232,0.6)]"
        style={{ padding: `${Math.round(size * 0.22)}px ${Math.round(size * 0.3)}px` }}
      >
        <span className="font-black leading-none tracking-tight" style={{ fontSize: size * 0.42 }}>
          G_
        </span>
      </span>
      {withWordmark && (
        <span className="hidden text-gc-ink sm:block" style={{ fontSize: size * 0.42, marginLeft: size * 0.22 }}>
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
    "bg-gc-cobalt text-white hover:bg-gc-cobalt-dark active:scale-[0.98]",
  secondary:
    "border border-white/15 text-gc-ink hover:border-white/35 hover:bg-white/[0.04] active:scale-[0.98]",
  ghost:
    "text-gc-muted hover:text-gc-ink hover:bg-white/[0.05] active:scale-[0.98]",
  danger:
    "bg-gc-orange text-white hover:bg-gc-orange-dark active:scale-[0.98]",
};

const btnSizes = {
  sm: "h-8 gap-1.5 px-3 text-[13px]",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2.5 px-6 text-[15px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, icon, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full font-semibold tracking-tight transition-all duration-150 whitespace-nowrap",
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
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-gc-muted transition-colors",
        "hover:bg-white/[0.05] hover:text-gc-ink active:scale-95",
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
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gc-muted"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#8b93a1]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-12 w-full rounded-xl border border-white/15 bg-[#0f1218] px-4 text-[15px] text-gc-ink placeholder:text-gc-faint",
              "transition-colors duration-150",
              "focus:border-gc-cobalt focus:outline-none focus:ring-2 focus:ring-gc-cobalt/25",
              mono && "font-mono tracking-tight",
              error ? "border-gc-orange" : "hover:border-white/30",
              icon ? "pl-10" : undefined,
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
          className={cn("rounded-full object-cover", ring && "ring-2 ring-surface")}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span
          className={cn(
            "flex items-center justify-center rounded-full font-bold text-[calc(var(--s)*0.4)]",
            "bg-gc-cobalt/15 text-[#8b9bff]",
            ring && "ring-2 ring-surface"
          )}
          style={{ "--s": size, width: size, height: size, fontSize: size * 0.4 } as React.CSSProperties}
        >
          {initials}
        </span>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-[#0b0d12]",
            online ? "bg-gc-mint" : "bg-gc-faint/60"
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
        "inline-flex items-center rounded-xl border border-white/15 bg-[#171b24] px-3 py-2 font-mono text-[13px] tracking-tight text-gc-ink",
        className
      )}
    >
      {children}
    </span>
  );
}