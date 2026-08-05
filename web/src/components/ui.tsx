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
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="gcl-mark" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0" stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--accent-strong)" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#gcl-mark)" />
        <rect x="1" y="1" width="38" height="38" rx="11" stroke="var(--accent-border)" />
        <path
          d="M14 20c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6"
          stroke="var(--bg)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="20" cy="20" r="2.4" fill="var(--bg)" />
        <rect x="19" y="20.5" width="2" height="6.5" rx="1" fill="var(--bg)" />
      </svg>
      {withWordmark && (
        <span className="font-mono text-[17px] font-semibold tracking-tight text-ink">
          G<span className="text-accent">_</span>Cloister
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
    "bg-accent text-[#06130e] dark:text-[#04120c] hover:bg-accent-strong active:bg-accent-strong shadow-[0_10px_30px_-10px_var(--accent-border)]",
  secondary:
    "bg-surface text-ink border border-border-strong hover:border-accent-border hover:text-accent active:scale-[0.98]",
  ghost:
    "text-muted hover:text-ink hover:bg-surface-2 active:scale-[0.98]",
  danger:
    "bg-danger-soft text-danger border border-transparent hover:border-danger/40 active:scale-[0.98]",
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
        "relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 whitespace-nowrap",
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
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors",
        "hover:text-ink hover:bg-surface-2 active:scale-95",
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
            className="text-[13px] font-medium text-muted tracking-tight"
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
              "w-full h-12 rounded-xl bg-surface-2 border px-4 text-[15px] text-ink placeholder:text-faint",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent-border",
              mono && "font-mono tracking-tight",
              error ? "border-danger/60" : "border-border hover:border-border-strong",
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
          <p className="text-[13px] text-danger">{error}</p>
        ) : hint ? (
          <p className="text-[13px] text-faint">{hint}</p>
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
            "flex items-center justify-center rounded-full font-medium text-[calc(var(--s)*0.4)]",
            "bg-accent-soft text-accent",
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
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-surface",
            online ? "bg-accent" : "bg-faint/60"
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

/* ---------- Glass card ---------- */
export function GlassCard({
  className,
  solid = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { solid?: boolean }) {
  return (
    <div
      className={cn(solid ? "glass-solid rounded-2xl" : "glass rounded-2xl", className)}
      {...props}
    />
  );
}

/* ---------- Kbd / mono chip ---------- */
export function MonoChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg bg-surface-2 border border-border px-2.5 py-1 font-mono text-[13px] tracking-tight text-ink",
        className
      )}
    >
      {children}
    </span>
  );
}
