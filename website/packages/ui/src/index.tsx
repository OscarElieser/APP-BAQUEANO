/**
 * WHY
 * Shares polished, accessible UI primitives across public web and admin.
 *
 * HOW
 * Provides small React components styled by Tailwind classes and stable states.
 *
 * WHAT
 * Buttons, metric tiles, section headers, and status chips.
 */
import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

export function BaqueanoButton({
  children,
  className,
  variant = "primary",
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "quiet" }>) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-bold uppercase tracking-normal transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F65E01] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-[#F65E01] text-white shadow-[0_16px_50px_rgba(246,94,1,0.28)] hover:bg-[#ff7a2b]",
        variant === "ghost" && "border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/16",
        variant === "quiet" && "bg-[#F4E6C1] text-[#0F172A] hover:bg-white",
        className
      )}
      {...props}
    >
      {children}
      {variant === "primary" ? <ArrowRight aria-hidden="true" size={16} /> : null}
    </button>
  );
}

export function SectionHeader({
  kicker,
  title,
  children,
  align = "left"
}: PropsWithChildren<{ kicker: string; title: string; align?: "left" | "center" }>) {
  return (
    <div className={clsx("mx-auto max-w-3xl", align === "center" && "text-center")}>
      <p className="font-tech text-xs font-bold uppercase tracking-normal text-[#F65E01]">{kicker}</p>
      <h2 className="mt-3 font-display text-3xl font-black leading-tight text-white md:text-5xl">{title}</h2>
      <div className="mt-4 text-base leading-7 text-white/72">{children}</div>
    </div>
  );
}

export function MetricTile({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-md border border-white/12 bg-white/[0.07] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur">
      <div className="flex items-center justify-between gap-3 text-[#F4E6C1]">{icon}</div>
      <strong className="mt-4 block font-tech text-3xl text-white">{value}</strong>
      <span className="mt-1 block text-sm text-white/66">{label}</span>
    </div>
  );
}

export function StatusChip({ children, tone = "teal" }: PropsWithChildren<{ tone?: "teal" | "orange" | "green" }>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 font-tech text-xs font-bold uppercase tracking-normal",
        tone === "teal" && "border-[#165D6F]/40 bg-[#165D6F]/18 text-[#9BD8E6]",
        tone === "orange" && "border-[#F65E01]/40 bg-[#F65E01]/18 text-[#FFC29B]",
        tone === "green" && "border-[#10B981]/40 bg-[#10B981]/18 text-[#9EF1D2]"
      )}
    >
      {children}
    </span>
  );
}
